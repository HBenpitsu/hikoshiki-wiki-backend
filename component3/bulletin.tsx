import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { Message } from  '../types/message';
import { MessageItem } from '../pages/messageitem';
import { createStackNavigator } from "@react-navigation/stack";
import { NativeStackScreenProps, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, Button, View } from "react-native";

import { db, getUserId } from '../lib/firebase'; 
import { Timestamp, collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

// <types>
// データ型の定義 本来ここでするべきものではない気もする．
type Thread = {
    id: string;
    // スレッドの最終更新日時等を表すシグネチャ
    // 更新のたびに変化することによって，クライアントが更新を検知できる
    signature: string;
    initialMessage: Message;
}
type Assignment = {
    id: string|undefined;
    name: string;
    dueDate: Timestamp;
}
// </types>



// <main component>
// exportするコンポーネント．つまり，このファイルに記述されるコンポーネントの中で一番外側に来るもの．
// ここでは画面遷移などを扱い，内容はここには書かない.CourseBulletin(授業掲示板)Screenの内容はCourseBulletinContentに書く．


// RootのStack.Navigatorに次の記述を追加すればこのページに遷移できます．
// <Stack.Screen name="SubjectBulletinScreen" component={SubjectBulletinScreen} options={{courseId: 'xxx'}}/>
// 動作確認時はinitialRouteNameをSubjectBulletinScreenにするのが楽です


type RootStackParamList = {
    SubjectBulletinScreen: { subjectId: string };
    Home: undefined;
}
type SubjectBulletinScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'SubjectBulletinScreen'>,
    subjectId: string,
}

// ページごとにrouteに格納されるパラメータの設定
type StackParamList = {
    BulletinContent: {};
    ThreadScreen: { thread: Thread, threadRepo: ForumRepository };
}
const Stack = createStackNavigator<StackParamList>();

// 参考: https://reactnavigation.org/docs/hello-react-navigation
export const SubjectBulletinScreen = ({navigation, subjectId: courseId}: SubjectBulletinScreenProps) => {
    return (
        <Stack.Navigator initialRouteName="BulletinContent" screenOptions={
            {headerShown: false,}
        }>
            <Stack.Screen name="BulletinContent">{
                (props)=>
                <CourseBulletinContent 
                    {...props} 
                    subjectId={courseId} 
                    goBack={
                        () => navigation.navigate('Home')
            }/>}</Stack.Screen>
            <Stack.Screen name="ThreadScreen" component={ThreadScreen}/>
        </Stack.Navigator>
    )
}
// </main component>



// <data>
// リポジトリ (インターフェイス) インターフェイス及び実装は本来ここではなくdatabaseディレクトリに定義されるべきだろうが，ここに記述しておく
// CurrentUserRepositoryはここに記述するべきではないが必要なので記述しておく
interface CurrentUser {
    get id(): string;
    get name(): string;
}
interface CourseInfoRepository {
    getSubjectName(subjectId: string): Promise<string>;
}
interface AssignmentInfoRepository {
    getAssignments(subjectId: string): Promise<Assignment[]>;
    saveAssignment(subjectId: string, assignment: Assignment): Promise<void>;
}
interface ForumRepository {
    getThreads(subjectId: string): Promise<Thread[]>;
    // Messege型はここで定義せずにtypes/message.tsを参照している
    getMessages(threadId: string): Promise<Message[]>;
    sendMessage(threadId: string, message: Message): Promise<void>;
}
// </data>



// <repository implementations>
class CurrentUserImpl implements CurrentUser {
    _id: string = '';
    _name: string = '';
    initialized: boolean = false;
    constructor() {
        getUserId().then((userId) => {
            this._id = userId;
            return getDocs(collection(db, "user"));
        }).then((docs)=>{
            docs.forEach((doc) => {
                if (doc.id != this._id) {return;}
                this._name = doc.data().username;
            })
            this.initialized = true;
        });
    }
    get id(): string {
        return this._id;
    }
    get name(): string {
        return this._name;
    }
}
class AssignmentInfoRepositoryImpl implements AssignmentInfoRepository {
    async getTargetDocForSubject(subjectId: string) {
        let docs = await getDocs(collection(db, "zyugyou"));
        let target: QueryDocumentSnapshot<DocumentData, DocumentData> | null = null;
        for (const doc of docs.docs) {
            if (doc.id == subjectId) {
                target = doc;
                break;
            }
        }
        return target;
    }
    async getAssignments(subjectId: string): Promise<Assignment[]> {
        let zyugyouDoc = await this.getTargetDocForSubject(subjectId);
        // asita??????? 何だそれ???
        let asitaDocs = await getDocs(zyugyouDoc.data().asita);

        type Assignment_variant = {
            homework: string;
        }

        const assignments: Assignment[] = [];
        for (const doc of asitaDocs.docs) {
            const data = doc.data() as Assignment_variant;
            assignments.push({
                id: doc.id,
                name: data.homework,
                dueDate: Timestamp.now(),
            });
        }
        return assignments;
    }
    async saveAssignment(subjectId: string, assignment: Assignment): Promise<void> {
        let zyugyouDoc = await this.getTargetDocForSubject(subjectId);
        // asita???????
        addDoc(zyugyouDoc.data().asita, {'homework': assignment.name});
    }
}
// </repository implementations>



// <mock data>
// インターフェイスの実装として，ダミーのデータを返すクラス（動作確認用）
class MockCurrentUser implements CurrentUser {
    get id(): string {
        return 'user1';
    }
    get name(): string {
        return 'Alice';
    }
}
class MockCourseInfoRepository implements CourseInfoRepository {
    async getSubjectName(courseId: string): Promise<string> {
        return 'コンピュータサイエンス';
    }
}
class MockAssignmentInfoRepository implements AssignmentInfoRepository {
    async getAssignments(courseId: string): Promise<Assignment[]> {
        const now = Timestamp.now();
        const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        return [
            {
                id: '1',
                name: '課題1',
                dueDate: yesterday,
            },
            {
                id: '2',
                name: '課題2',
                dueDate: now,
            },
        ]
    }
    async saveAssignment(courseId: string, assignment: Assignment): Promise<void> {
        return;
    }
}
class MockForumRepository implements ForumRepository {
    async getThreads(contextId: string): Promise<Thread[]> {
        const now = Timestamp.now();
        const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        return [
            {
                id: '1',
                signature: '',
                initialMessage: {
                    id: '1',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user1',
                    userName: 'Alice',
                }
            },
            {
                id: '2',
                signature: '',
                initialMessage: {
                    id: '2',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user2',
                    userName: 'Bob',
                }
            },
        ]
    }
    async getMessages(threadId: string): Promise<Message[]> {
        const now = Timestamp.now();
        const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        const aMomentLater = Timestamp.fromMillis(yesterday.toMillis() + 60 * 1000);
        if (threadId === '1') {
            return [
                {
                    id: '1',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user1',
                    userName: 'Alice',
                },
                {
                    id: '3',
                    text: 'メッセージ2',
                    createdAt: aMomentLater,
                    userId: 'user2',
                    userName: 'Bob',
                },
            ]
        } else {
            return [
                {
                    id: '2',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user2',
                    userName: 'Bob',
                }
            ]
        }
    }
    async sendMessage(threadId: string, message: Message): Promise<void> {
        return;
    }
}
class MockForumRepository1 implements ForumRepository {
    async getThreads(contextId: string): Promise<Thread[]> {
        const now = Timestamp.now();
        const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        return [
            {
                id: '1',
                signature: '',
                initialMessage: {
                    id: '1',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user1',
                    userName: 'Alice',
                }
            },
            {
                id: '2',
                signature: '',
                initialMessage: {
                    id: '2',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user2',
                    userName: 'Bob',
                }
            },
        ]
    }
    async getMessages(threadId: string): Promise<Message[]> {
        const now = Timestamp.now();
        const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        const aMomentLater = Timestamp.fromMillis(yesterday.toMillis() + 60 * 1000);
        if (threadId === '1') {
            return [
                {
                    id: '1',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user1',
                    userName: 'Alice',
                },
                {
                    id: '3',
                    text: 'メッセージ2',
                    createdAt: aMomentLater,
                    userId: 'user2',
                    userName: 'Bob',
                },
            ]
        } else {
            return [
                {
                    id: '2',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user2',
                    userName: 'Bob',
                }
            ]
        }
    }
    async sendMessage(threadId: string, message: Message): Promise<void> {
        return;
    }
}
class MockForumRepository2 implements ForumRepository {
    async getThreads(contextId: string): Promise<Thread[]> {
        const now = Timestamp.now();
        const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        return [
            {
                id: '1',
                signature: '',
                initialMessage: {
                    id: '1',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user1',
                    userName: 'Alice',
                }
            },
            {
                id: '2',
                signature: '',
                initialMessage: {
                    id: '2',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user2',
                    userName: 'Bob',
                }
            },
        ]
    }
    async getMessages(threadId: string): Promise<Message[]> {
        const now = Timestamp.now();
        const yesterday = Timestamp.fromMillis(now.toMillis() - 24 * 60 * 60 * 1000);
        const aMomentLater = Timestamp.fromMillis(yesterday.toMillis() + 60 * 1000);
        if (threadId === '1') {
            return [
                {
                    id: '1',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user1',
                    userName: 'Alice',
                },
                {
                    id: '3',
                    text: 'メッセージ2',
                    createdAt: aMomentLater,
                    userId: 'user2',
                    userName: 'Bob',
                },
            ]
        } else {
            return [
                {
                    id: '2',
                    text: '最初のメッセージ',
                    createdAt: yesterday,
                    userId: 'user2',
                    userName: 'Bob',
                }
            ]
        }
    }
    async sendMessage(threadId: string, message: Message): Promise<void> {
        return;
    }
}
// </mock data>



// <repository instance>
const currentUser: CurrentUser = new CurrentUserImpl();
const courseInfoRepository: CourseInfoRepository = new MockCourseInfoRepository();
const assignmentInfoRepository: AssignmentInfoRepository = new AssignmentInfoRepositoryImpl();
const testForumRepository: ForumRepository = new MockForumRepository();
const infoForumRepository: ForumRepository = new MockForumRepository1();
const freeForumRepository: ForumRepository = new MockForumRepository2();
// </repository instance>



// <sub components>
// 掲示板/BulletinBoard: フォーラムの集まり
// CourseBulletinContent: 
type CourseBulletinContentProps = {
    navigation: NativeStackNavigationProp<StackParamList, 'BulletinContent'>;
    goBack: () => void;
    subjectId: string;
}
const CourseBulletinContent = ({navigation, goBack, subjectId}: CourseBulletinContentProps) => {
    const [courseName, setCourseName] = useState('');
    useEffect(() => {
        courseInfoRepository.getSubjectName(subjectId).then((name) => {
            setCourseName(name);
        })
    }, []);
    return (
        <View>
            <Button title='back' onPress={goBack}/>
            <Text>{courseName} 掲示板</Text>
            <AssignmentInfoView subjectId={subjectId}/>
            <Forum title='テストの詳細' forumRepo={testForumRepository} subjectId={subjectId} navigation={navigation}></Forum>
            <Forum title='教室移動などの連絡事項' forumRepo={infoForumRepository} subjectId={subjectId} navigation={navigation}/>
            <Forum title='掲示板' forumRepo={freeForumRepository} subjectId={subjectId} navigation={navigation}/>
        </View>
    )
}

// AssignmentInfoView: 課題の情報を表示する
type AssignmentInfoViewProps = {
    subjectId: string;
}
const AssignmentInfoView = ({subjectId}: AssignmentInfoViewProps) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    useEffect(() => {
        assignmentInfoRepository.getAssignments(subjectId).then((assignments) => {
            setAssignments(assignments);
        })
    }, []);
    return (<>
        <Text>現在提示中の課題</Text>
        <View>
            {assignments.map((assignment) => (
                <Text key={assignment.id}>{assignment.name} {assignment.dueDate.toDate().toString()}</Text>
            ))}
        </View>
    </>);
}

// Forum: フォーラム ThreadTitleの集まり
type ForumProps = {
    title: string;
    forumRepo: ForumRepository;
    subjectId: string;
    navigation: NativeStackNavigationProp<StackParamList, "BulletinContent", undefined>;
}
const Forum = ({title, subjectId, forumRepo, navigation}: ForumProps) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    useEffect(() => {
        forumRepo.getThreads(subjectId).then((threads) => {
            setThreads(threads);
        })
    }, []);
    return (
        <>
            <Text>{title}</Text>
            <View>
                {threads.map((thread) => (
                    <ThreadTitle thread={thread} threadRepo={freeForumRepository} navigation={navigation} key={thread.id}/>
                ))}
            </View>
        </>
    )
}

// ThreadTitle: スレッド画面を表示するボタン
type ThreadTitleProps = {
    thread: Thread, 
    threadRepo: ForumRepository,
    navigation: NativeStackNavigationProp<StackParamList, "BulletinContent", undefined>
}
const ThreadTitle = ({thread, threadRepo, navigation} :ThreadTitleProps) => {   
    return (
        <Button title={thread.initialMessage.text} onPress={
            () => navigation.navigate('ThreadScreen', {thread: thread, threadRepo: threadRepo})
        }/>
    )
}

// ThreadScreen: スレッド画面
const ThreadScreen = ({navigation, route}: NativeStackScreenProps<StackParamList, 'ThreadScreen'>) => {
    const {thread, threadRepo} = route.params;

    const [messages, setMessages] = useState<Message[]>([]);
    useEffect(() => {
        threadRepo.getMessages(thread.id).then((messages) => {
            setMessages(messages);
        })
    }, [thread.id, thread.signature]);
    
    return (
        <>
            <View>
                <Button title='back' onPress={
                    () => navigation.goBack()
                }/>
            </View>
            
            <View>
            <Text>{thread.initialMessage.text}</Text>
            <Text>{thread.initialMessage.userName}</Text>
            <Text>{thread.initialMessage.createdAt.toString()}</Text>
            </View>

            <View>
                {messages.map((message) => (
                    // MessageItemはこのファイル内では定義されていない（pages内のものを呼び出している）
                    <MessageItem message={message} userId={currentUser.id} key={message.id}/>
                ))}
            </View>

            <MessagePostForm threadId={thread.id} threadRepo={threadRepo}/>
        </>
    )
}

type MessagePostFormProps = {threadId: string, threadRepo: ForumRepository}
const MessagePostForm = ({threadId, threadRepo}: MessagePostFormProps) => {
    const [newMessage, setNewMessage] = useState('');
    return <>
    <TextInput
        style={{
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          height: 100,
          textAlignVertical: "top",
        }}
        placeholder="メッセージを入力"
        value={newMessage}
        onChangeText={(text) => setNewMessage(text)}
        multiline
    />
    <Button title='post' onPress={
        () => {
            testForumRepository.sendMessage(threadId, {
                id: '',
                text: newMessage,
                createdAt: Timestamp.now(),
                userId: currentUser.id,
                userName: currentUser.name,
            }).then(() => {
                setNewMessage('');
            })
        }
    }/>
    </>
}
// </sub components>