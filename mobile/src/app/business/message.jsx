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
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new;
          if ((newMsg.sender_id === user.id && newMsg.receiver_id === partnerId) ||
              (newMsg.sender_id === partnerId && newMsg.receiver_id === user.id)) {
            setMessages(prev => [...prev, newMsg]);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (text = null, mediaUrl = null, mediaType = null) => {
    const messageText = text || input.trim();
    if (!messageText && !mediaUrl) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: partnerId,
          text: messageText,
          media_url: mediaUrl,
          media_type: mediaType,
        });

      if (error) throw error;
      setInput("");
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadMedia(result.assets[0].uri, 'image');
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
    uploadMedia(uri, 'audio');
  };

  const uploadMedia = async (uri, type) => {
    try {
      setUploading(true);
      const ext = uri.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const path = `${type}s/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: type === 'image' ? `image/${ext}` : `audio/${ext}`,
      });

      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(path, formData);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(path);

      sendMessage(null, publicUrl, type);
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert("Error", "Failed to upload media.");
    } finally {
      setUploading(false);
    }
  };

  const AudioPlayer = ({ url }) => {
    const [sound, setSound] = useState(null);
    const [playing, setPlaying] = useState(false);

    const playSound = async () => {
      if (sound) {
        await sound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync({ uri: url });
        setSound(sound);
        await sound.playAsync();
      }
      setPlaying(true);
      sound?.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setPlaying(false);
      });
    };

    const pauseSound = async () => {
      await sound?.pauseAsync();
      setPlaying(false);
    };

    return (
      <TouchableOpacity 
        onPress={playing ? pauseSound : playSound}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
      >
        {playing ? <Pause size={20} color="#fff" /> : <Play size={20} color="#fff" />}
        <View style={{ height: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
        <Text style={{ color: '#fff', fontSize: 10 }}>Voice Note</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
        <Image
          source={{ uri: partnerAvatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
            borderWidth: 2,
            borderColor: colors.primary,
          }}
          contentFit="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: typography.weight.extrabold, color: colors.text }}>
            {partnerName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#6BCB77' }} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Online</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL('tel:+233200000000')}
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
            const isMe = msg.sender_id !== partnerId;
            const showTime = index === 0 || 
              new Date(msg.created_at).getTime() - new Date(messages[index-1].created_at).getTime() > 300000;

            return (
              <View key={msg.id}>
                {showTime && (
                  <View style={{ alignItems: 'center', marginVertical: 16 }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>
                      {format(new Date(msg.created_at), 'EEE, d MMM • p')}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    marginBottom: 12,
                    alignItems: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isMe ? colors.primary : colors.card,
                      borderRadius: 18,
                      borderBottomRightRadius: isMe ? 4 : 18,
                      borderBottomLeftRadius: isMe ? 18 : 4,
                      padding: msg.media_type === 'image' ? 4 : 12,
                      maxWidth: "80%",
                      ...shadows.xs,
                    }}
                  >
                    {msg.media_type === 'image' && (
                      <Image 
                        source={{ uri: msg.media_url }} 
                        style={{ width: 220, height: 220, borderRadius: 14 }}
                        contentFit="cover"
                      />
                    )}
                    {msg.media_type === 'audio' && (
                      <View style={{ width: 180 }}>
                        <AudioPlayer url={msg.media_url} />
                      </View>
                    )}
                    {msg.text && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: isMe ? colors.white : colors.text,
                          lineHeight: 20,
                        }}
                      >
                        {msg.text}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
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
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.text,
              paddingVertical: 10,
              maxHeight: 100,
            }}
            multiline
            disabled={isRecording || uploading}
          />
          {isRecording && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, position: 'absolute', right: 10, backgroundColor: colors.inputBg }}>
               <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4B4B' }} />
               <Text style={{ color: '#FF4B4B', fontWeight: '700', fontSize: 12 }}>Recording...</Text>
            </View>
          )}
        </View>

        {input.trim() || uploading ? (
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
