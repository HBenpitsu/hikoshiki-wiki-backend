import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { submitDataToFirestore } from "../backend";

const InputScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [longTextInput, setLongTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRadioButton, setSelectedRadioButton] = useState("");
  const [selectedListButtons, setSelectedListButtons] = useState([]);
  const [starRating, setStarRating] = useState(0);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleListButtonPress = (value) => {
    if (selectedListButtons.includes(value)) {
      setSelectedListButtons(
        selectedListButtons.filter((item) => item !== value)
      );
    } else {
      setSelectedListButtons([...selectedListButtons, value]);
    }
  };

  const handleSubmit = async () => {
    if (
      !textInput ||
      !selectedOption ||
      !selectedDate ||
      !selectedRadioButton ||
      selectedListButtons.length === 0 ||
      starRating === 0
    ) {
      Alert.alert("全てのフィールドを入力してください");
      return;
    }

    const data = {
      textInput,
      longTextInput,
      selectedOption,
      selectedDate,
      selectedRadioButton,
      selectedListButtons,
      starRating,
    };

    // コレクション名を "useee" に指定
    const collectionName = "useee"; // ここでコレクション名を指定
    await submitDataToFirestore(data, collectionName);
    Alert.alert("送信が完了しました");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>文字を入力:</Text>
      <TextInput
        style={{ borderColor: "gray", borderWidth: 1, marginBottom: 20 }}
        placeholder="テキストを入力"
        value={textInput}
        onChangeText={setTextInput}
      />

      <Text>長文を入力:</Text>
      <TextInput
        style={{
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          height: 100,
          textAlignVertical: "top",
        }}
        placeholder="長文を入力"
        value={longTextInput}
        onChangeText={(text) => setLongTextInput(text)}
        multiline
      />
      <Text>文字数: {longTextInput.length}</Text>

      <Text>オプションを選択:</Text>
      <RNPickerSelect
        onValueChange={(value) => setSelectedOption(value)}
        items={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]}
      />

      <Text>日付を選択:</Text>
      <View style={{ marginBottom: 20 }}>
        <Button title="日付を選択" onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        <Text>選択された日付: {selectedDate.toDateString()}</Text>
      </View>

      <Text>ラジオボタンを選択:</Text>
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        {["ラジオ1", "ラジオ2", "ラジオ3"].map((label, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedRadioButton(label)}
            style={{
              padding: 10,
              backgroundColor:
                selectedRadioButton === label ? "lightblue" : "white",
              borderWidth: 1,
              borderColor: "gray",
              marginHorizontal: 5,
            }}
          >
            <Text>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text>リストボタンを選択:</Text>
      <View style={{ flexDirection: "column", marginBottom: 20 }}>
        {["リスト1", "リスト2", "リスト3"].map((label, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleListButtonPress(label)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              backgroundColor: selectedListButtons.includes(label)
                ? "lightblue"
                : "white",
              borderWidth: 1,
              borderColor: "gray",
              marginVertical: 5,
            }}
          >
            <Text style={{ marginRight: 10 }}>
              {selectedListButtons.includes(label) ? "●" : "○"}
            </Text>
            <Text>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text>評価を選択:</Text>
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            onPress={() => setStarRating(rating)}
            style={{ marginHorizontal: 5 }}
          >
            <Text
              style={{
                fontSize: 30,
                color: rating <= starRating ? "gold" : "gray",
              }}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="送信" onPress={handleSubmit} />
    </View>
  );
};

export default InputScreen;
