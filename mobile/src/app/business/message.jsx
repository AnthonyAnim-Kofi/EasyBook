import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Phone,
  MoreVertical,
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Play,
  Pause,
  X,
  Check,
  CheckCheck,
} from "lucide-react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from "@/utils/supabase";
import { colors, typography, radius, shadows } from "@/theme";
import { format } from "date-fns";

export default function BusinessMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { id: partnerId, name: partnerName, avatar: partnerAvatar } = params;
  
  const [currentUser, setCurrentUser] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null); // { uri, type }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openReceipt, setOpenReceipt] = useState(null); // message id whose receipt popover is shown
  const scrollRef = useRef(null);
  const markReadTimerRef = useRef(null);
  const receiptHideTimerRef = useRef(null);

  // Debounced mark-as-read: coalesces bursts and reconnect re-syncs into one write
  const markPartnerMessagesRead = (user, { immediate = false } = {}) => {
    if (!user) return;
    if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    const run = async () => {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', partnerId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
      } catch (err) {
        console.warn('Failed to mark messages read:', err);
      }
    };
    if (immediate) {
      run();
    } else {
      markReadTimerRef.current = setTimeout(run, 600);
    }
  };


  useEffect(() => {
    let channel = null;
    let cancelled = false;

    const setup = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user || cancelled) return;

      setCurrentUser(data.user);
      await fetchMessages(data.user);
      markPartnerMessagesRead(data.user, { immediate: true });

      // Fetch partner profile
      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (pData && !cancelled) setPartnerProfile(pData);

      const subscribe = () => {
        const channelName = `chat-${data.user.id}-${partnerId}-${Date.now()}`;
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
              const newMsg = payload.new;
              if (newMsg.sender_id !== partnerId && newMsg.receiver_id !== partnerId) return;
              setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, { ...newMsg, isMe: String(newMsg.sender_id) === String(data.user.id) }];
              });
              // If it's an incoming message, mark it read immediately (chat is open)
              if (String(newMsg.receiver_id) === String(data.user.id)) {
                markPartnerMessagesRead(data.user);
              }
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'messages' },
            (payload) => {
              const updated = payload.new;
              if (updated.sender_id !== partnerId && updated.receiver_id !== partnerId) return;
              setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated, isMe: m.isMe } : m));
            }
          )
          .subscribe((status) => {
            // Re-sync on (re)connect: refetch + re-mark read to recover from any missed events
            if (status === 'SUBSCRIBED') {
              fetchMessages(data.user);
              markPartnerMessagesRead(data.user);
            }
          });
      };

      subscribe();
    };

    setup();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      if (receiptHideTimerRef.current) clearTimeout(receiptHideTimerRef.current);
    };
  }, [partnerId]);

  // Sorted view of messages — handles slightly out-of-order realtime arrivals
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Unread = messages from partner to me that aren't yet marked read
  const unreadCount = messages.filter(
    (m) => !m.isMe && !m.is_read && String(m.receiver_id) === String(currentUser?.id)
  ).length;


  const fetchMessages = async (user) => {
    try {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Process messages to include isMe property immediately
      const processed = data.map(m => ({
        ...m,
        isMe: String(m.sender_id) === String(user.id)
      }));
      
      setMessages(processed);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text = null) => {
    const messageText = text || input.trim();
    if (!messageText && !selectedMedia) return;

    try {
      const user = currentUser || (await supabase.auth.getUser()).data.user;
      if (!user) return;

      let mediaUrl = null;
      let mediaType = null;

      if (selectedMedia) {
        setUploading(true);
        mediaUrl = await uploadMedia(selectedMedia.uri, selectedMedia.type);
        mediaType = selectedMedia.type;
        setSelectedMedia(null);
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: partnerId,
          text: messageText,
          media_url: mediaUrl,
          media_type: mediaType,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Add local message with isMe true
      const localMsg = { ...data, isMe: true };
      setMessages(prev => [...prev, localMsg]);
      setInput("");
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert("Error", "Failed to send message.");
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia({ uri: result.assets[0].uri, type: 'image' });
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setSelectedMedia({ uri, type: 'audio' });
  };

  const uploadMedia = async (uri, type) => {
    const ext = uri.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${type}s/${fileName}`;

    const response = await fetch(uri);
    const blob = await response.blob();
    const contentType = type === 'image' ? `image/${ext}` : `audio/${ext}`;

    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(path, blob, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(path);

    return publicUrl;
  };

  const AudioPlayer = ({ url, isMe }) => {
    const [sound, setSound] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [status, setStatus] = useState(null);

    const onPlaybackStatusUpdate = (newStatus) => {
      setStatus(newStatus);
      if (newStatus.didJustFinish) {
        setPlaying(false);
        sound?.setPositionAsync(0);
      }
    };

    const togglePlay = async () => {
      if (sound) {
        if (playing) {
          await sound.pauseAsync();
          setPlaying(false);
        } else {
          await sound.playAsync();
          setPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setPlaying(true);
      }
    };

    useEffect(() => {
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [sound]);

    const progress = (status?.positionMillis || 0) / (status?.durationMillis || 1);
    const bars = [8, 14, 10, 18, 12, 16, 20, 14, 18, 10, 14, 8, 12, 16]; // Simulated waveform bars
    
    const primaryColor = isMe ? "#fff" : colors.primary;
    const secondaryColor = isMe ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.1)";

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
        <TouchableOpacity 
          onPress={togglePlay}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isMe ? "rgba(255,255,255,0.2)" : colors.inputBg,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {playing ? <Pause size={16} color={primaryColor} fill={primaryColor} /> : <Play size={16} color={primaryColor} fill={primaryColor} />}
        </TouchableOpacity>
        
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, height: 24 }}>
          {bars.map((h, i) => (
            <View 
              key={i} 
              style={{ 
                flex: 1,
                height: h, 
                borderRadius: 2, 
                backgroundColor: (i / bars.length) < progress ? primaryColor : secondaryColor 
              }} 
            />
          ))}
        </View>
        
        <Text style={{ color: isMe ? "rgba(255,255,255,0.8)" : colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
          {status?.durationMillis ? formatDuration(status.positionMillis || 0) : 'Voice'}
        </Text>
      </View>
    );
  };

  const formatDuration = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          flexDirection: "row",
          alignItems: "center",
          ...shadows.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: colors.inputBg,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <ArrowLeft size={18} color={colors.text} />
        </TouchableOpacity>
        <View style={{ position: 'relative', marginRight: 10 }}>
          <Image
            source={{ uri: partnerProfile?.avatar_url || partnerAvatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: colors.primary,
            }}
            contentFit="cover"
          />
          {unreadCount > 0 && (
            <View
              accessible
              accessibilityLabel={`${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`}
              accessibilityLiveRegion="polite"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                paddingHorizontal: 5,
                borderRadius: 10,
                backgroundColor: '#FF4B4B',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.card,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: typography.weight.extrabold, color: colors.text }}>
            {partnerProfile?.business_name || partnerProfile?.username || partnerName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#6BCB77' }} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Online</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            const phone = partnerProfile?.phone || params.phone;
            if (phone) {
              Linking.openURL(`tel:${phone}`);
            } else {
              Alert.alert("Notice", "Phone number not available for this user.");
            }
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.inputBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Phone size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 20,
            paddingBottom: 20,
          }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg, index) => {
            const isMe = msg.isMe ?? (String(msg.sender_id) === String(currentUser?.id));
            const prev = messages[index - 1];
            const next = messages[index + 1];
            const curTime = new Date(msg.created_at).getTime();

            const showDateHeader =
              !prev || curTime - new Date(prev.created_at).getTime() > 300000;

            // Cluster = consecutive messages from same sender within 2 minutes
            const isLastInCluster =
              !next ||
              String(next.sender_id) !== String(msg.sender_id) ||
              new Date(next.created_at).getTime() - curTime > 120000;

            const status = msg.is_read ? 'Read' : msg.id ? 'Delivered' : 'Sent';
            const statusLabel = `Message ${status.toLowerCase()}`;

            return (
              <View key={msg.id}>
                {showDateHeader && (
                  <View style={{ alignItems: 'center', marginVertical: 16 }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>
                      {format(new Date(msg.created_at), 'EEE, d MMM • p')}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    marginBottom: isLastInCluster ? 12 : 3,
                    alignItems: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isMe ? colors.primary : colors.primarySurface,
                      borderWidth: isMe ? 0 : 1,
                      borderColor: isMe ? 'transparent' : colors.borderLight,
                      borderRadius: 20,
                      borderBottomRightRadius: isMe ? 6 : 20,
                      borderBottomLeftRadius: isMe ? 20 : 6,
                      paddingVertical: msg.media_type === 'image' ? 4 : 12,
                      paddingHorizontal: msg.media_type === 'image' ? 4 : 16,
                      maxWidth: "80%",
                      ...shadows.xs,
                    }}
                  >
                    {msg.media_type === 'image' && (
                      <Image
                        source={{ uri: msg.media_url }}
                        style={{ width: 220, height: 220, borderRadius: 16 }}
                        contentFit="cover"
                      />
                    )}
                    {msg.media_type === 'audio' && (
                      <View style={{ width: 200 }}>
                        <AudioPlayer url={msg.media_url} isMe={isMe} />
                      </View>
                    )}
                    {msg.text && (
                      <Text
                        style={{
                          fontSize: 15,
                          color: isMe ? "#fff" : colors.text,
                          lineHeight: 22,
                          marginTop: msg.media_type ? 8 : 0,
                          paddingHorizontal: msg.media_type ? 8 : 0,
                          paddingBottom: msg.media_type ? 4 : 0,
                        }}
                      >
                        {msg.text}
                      </Text>
                    )}
                  </View>
                  {isLastInCluster && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 4,
                        paddingHorizontal: 6,
                      }}
                    >
                      <Text style={{ fontSize: 10.5, color: colors.textMuted, fontWeight: '500' }}>
                        {format(new Date(msg.created_at), 'p')}
                      </Text>
                      {isMe && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => Alert.alert(status, `This message has been ${status.toLowerCase()}.`)}
                          accessibilityRole="image"
                          accessibilityLabel={statusLabel}
                          accessibilityHint="Double tap to view delivery status"
                          hitSlop={8}
                        >
                          {status === 'Read' ? (
                            <CheckCheck size={13} color={colors.primary} />
                          ) : status === 'Delivered' ? (
                            <CheckCheck size={13} color={colors.textMuted} />
                          ) : (
                            <Check size={13} color={colors.textMuted} />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Media Preview */}
      {selectedMedia && (
        <View style={{ 
          padding: 12, 
          backgroundColor: colors.card, 
          borderTopWidth: 1, 
          borderTopColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12
        }}>
          <View style={{ position: 'relative' }}>
            {selectedMedia.type === 'image' ? (
              <Image source={{ uri: selectedMedia.uri }} style={{ width: 50, height: 50, borderRadius: 8 }} />
            ) : (
              <View style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={20} color={colors.primary} />
              </View>
            )}
            <TouchableOpacity 
              onPress={() => setSelectedMedia(null)}
              style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#FF4B4B', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card }}
            >
              <X size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: '600' }}>
              {selectedMedia.type === 'image' ? 'Image selected' : 'Voice note recorded'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>Add a caption below or just send</Text>
          </View>
        </View>
      )}

      {/* Input bar */}
      <View
        style={{
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={pickImage}
          disabled={uploading}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.inputBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImageIcon size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.inputBg,
            borderRadius: 22,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            minHeight: 44,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={selectedMedia ? "Add a caption..." : "Type a message..."}
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.text,
              paddingVertical: 10,
              maxHeight: 100,
            }}
            multiline
            editable={!isRecording && !uploading}
          />
          {isRecording && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, position: 'absolute', right: 10, backgroundColor: colors.inputBg }}>
               <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4B4B' }} />
               <Text style={{ color: '#FF4B4B', fontWeight: '700', fontSize: 12 }}>Recording...</Text>
            </View>
          )}
        </View>

        {(input.trim() || selectedMedia || uploading) ? (
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={uploading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isRecording ? '#FF4B4B' : colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mic size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
