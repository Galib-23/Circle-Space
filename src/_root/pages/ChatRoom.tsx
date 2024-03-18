import { useCreateMessage, useGetCurrentUser, useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { Link, useParams } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  message: z.string().min(1, {
    message: "Message must be at least 1 character.",
  }),
})

const ChatRoom = () => {

  const { toast } = useToast()
  const { id } = useParams();
  const { data: userChattingTo } = useGetUserById(id || "");
  const { mutateAsync: createMessage } = useCreateMessage();
  const { data: currentUser } = useGetCurrentUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const messageRes = await createMessage({
      message: values.message,
      userId: currentUser?.$id || '',
    })
    if (!messageRes) {
      return toast({ title: 'Sign in failed. Please try againg' })
    }
    form.reset();
  }

  return (
    <div className="h-screen flex flex-col w-full p-1 lg:p-10">
      <Link to={`/chats/${userChattingTo?.$id}`} className="flex items-center gap-3 mb-8">
        <img className="h-16 w-16 rounded-full border-2 border-violet-700" src={userChattingTo?.imageUrl} alt="P" />
        <p className="text-lg">{userChattingTo?.name}</p>
      </Link>
      <div className="flex-1 overflow-y-scroll">
        <h1>messagesss</h1>
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
  )
}

export default ChatRoom
