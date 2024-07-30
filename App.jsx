import React, { useState, useRef, useEffect } from 'react';
import { View, Image, ImageBackground, TextInput, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Text, Modal } from 'react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";
import sendIcon from './images/send.png';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

const App = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoInternetPopup, setShowNoInternetPopup] = useState(false);
  const scrollViewRef = useRef();

  const handleProcessText = async () => {
    setIsLoading(true);
    const newMessages = [
      ...messages,
      { text: inputText, type: 'user' }
    ];
    setMessages(newMessages);

    try {
      const genAI = new GoogleGenerativeAI('YOUR-GEMINI-API-KEY');
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent(inputText);
      const response = await result.response;
      const botResponse = response.text();

      const updatedMessages = [
        ...newMessages,
        { text: botResponse, type: 'bot' }
      ];
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error processing text:', error);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setShowNoInternetPopup(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  }, [messages]);

  const handleTryAgain = () => {
    setShowNoInternetPopup(false);
    handleProcessText();
  };

  return (
    <ImageBackground
      source={require('./images/boat.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.viewstyle}>
          <Image
            source={require('./images/header.png')}
            style={styles.image}
          />
        </View>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
        >
          {messages.map((message, index) => (
            <View key={index} style={[
              styles.message,
              message.type === 'user' ? styles.userMessage : styles.botMessage
            ]}>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter question"
            value={inputText}
            placeholderTextColor="gray"
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={() => {
                if (inputText.trim() !== '') { // Check if inputText is not empty
                    handleProcessText(); // Call the function
                    setInputText(''); // Clear input text
                }
            }}>
                <Image
                    source={sendIcon}
                    style={styles.sendIcon}
                />
            </TouchableOpacity>

        </View>
        <Modal
          visible={showNoInternetPopup}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>No Internet Connection</Text>
              <Text style={styles.modalText}>Please check your internet connection and try again.</Text>
              <TouchableOpacity onPress={handleTryAgain} style={styles.tryAgainButton}>
                <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  messagesContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  message: {
    maxWidth: '70%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#66000000'
  },
  textInput: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: 'dark',
    color: 'white'
  },
  viewstyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  sendIcon: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
    width: 45,
    height: 45,
    borderColor: 'white'
  },
  image: {
    width: 200,
    height: 60,
    borderRadius: 10,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  tryAgainButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  tryAgainButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default App;
