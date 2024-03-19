import { useCreateMessage, useGetCurrentUser, useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { Link, useParams } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { appwriteConfig, client, databases } from "@/lib/appwrite/config";
import { Models, Query } from "appwrite";
import Loader from "@/components/shared/Loader";
import { convertTime } from "@/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message must be at least 1 character.",
  }),
})


const ChatRoom = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const { data: userChattingTo } = useGetUserById(id || "");
  const { mutateAsync: createMessage } = useCreateMessage();
  const { data: currentUser } = useGetCurrentUser();
  const [messages, setMessages] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMessages();
    const unsubscribe = client.subscribe(`databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messageCollectionId}.documents`, response => {
      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        setMessages((prevState: any) => [response.payload, ...prevState]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function getMessages() {
    try {
      const messages = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        [Query.orderAsc("$createdAt"), Query.limit(20)],
      );
      if (!messages) throw Error;
      setMessages(messages.documents);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser || !currentUser.$id) {
      return toast({ title: 'User not authenticated.' });
    }
    const messageRes = await createMessage({
      message: values.message,
      sender: currentUser.$id,
      reciever: id || '',
    });
    if (!messageRes) {
      return toast({ title: 'Failed to send message. Please try again.' });
    }
    form.reset();
  }
  if (!currentUser) return <Loader />
  // console.log(currentUser.$id)
  // console.log(id);
  // console.log(messages)
  const filteredMessages = messages.filter((message: Models.Document) =>
    (message.sender === currentUser?.$id && message.reciever === id) ||
    (message.reciever === currentUser?.$id && message.sender === id)
  );
  console.log(filteredMessages)
  return (
    <div className="h-screen flex flex-col w-full p-1 lg:p-10">
      <Link to={`/chats/${userChattingTo?.$id}`} className="flex items-center gap-3 mb-8">
        <img className="h-16 w-16 rounded-full border-2 border-violet-700" src={userChattingTo?.imageUrl} alt="P" />
        <p className="text-lg">{userChattingTo?.name}</p>
      </Link>
      <div className="flex-1 overflow-y-scroll">
        {loading ? (
          <Loader />
        ) : (
          <ul>
            {filteredMessages.map((message) => (
              <li key={message.$id} className="flex justify-between items-baseline mt-3">
                <div className="flex items-center gap-2">
                  <img className="w-9 h-9 rounded-full" src={
                    message.sender === currentUser.$id ?
                      currentUser.imageUrl : userChattingTo?.imageUrl
                  } alt="" />
                  <div className={`flex items-center gap-3 border-[1px] ${message.sender === currentUser.$id ? 'bg-violet-400 text-black' : 'text-white'} border-violet-400 w-fit p-2 rounded-xl`}>
                    <p>{message.messageBody}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs">{convertTime(message.$createdAt)}</p>
                </div>
              </li>

            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="shad-button_primary">Send</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ChatRoom;
