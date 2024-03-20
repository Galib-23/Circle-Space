import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { useCreateComment, useDeletePost, useGetCurrentUser, useGetPostById, useGetPostComments } from "@/lib/react-query/queriesAndMutations"
import { convertTime, timeAgo } from "@/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom"


import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  comment: z.string().min(1).max(3000),
})


const PostDetails = () => {

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  })

  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || '');
  const { mutateAsync: deletePost } = useDeletePost();
  const { user } = useUserContext();
  const { mutateAsync: createComment } = useCreateComment();
  const { data: currentUser } = useGetCurrentUser()
  const { data: postComments, isPending: isCommentsLoading } = useGetPostComments(id || '');

  async function handleDeletePost(postId: string, imageId: string) {
    const deleteRes = await deletePost({
      postId, imageId
    })
    if (!deleteRes) {
      toast({ title: 'Sorry, try again.' })
    } else {
      toast({ title: 'Post deleted successfully.' })
      navigate('/');
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    if (!user && !currentUser) {
      return toast({ title: 'User not authenticated.' });
    }
    const commentRes = await createComment({
      comment: values.comment,
      userId: currentUser?.$id || '',
      userName: currentUser?.username,
      postId: id || '',
      userImage: currentUser?.imageUrl,
    });
    if (!commentRes) {
      return toast({ title: 'Failed to post comment. Please try again.' });
    }
    form.reset();
  }

  if (!user && !currentUser) {
    return <Loader />
  }
  return (
    <div className="flex flex-col flex-1 gap-10 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      {
        isPending ? <Loader /> : (
          <div className="post_details-card">
            <img src={post?.imageUrl} alt="post" className="post_details-img" />
            <div className="post_details-info">
              <div className="flex-between w-full">
                <Link to={`/profile/${post?.creator.$id}`} className="flex items-center gap-3">
                  <img src={post?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="creator" className="rounded-full h-8 w-8 lg:w-12 lg:h-12" />
                  <div className="flex flex-col">
                    <p className="base-medium lg:body-bold text-light-1">{post?.creator.name}</p>
                    <div className="flex-center gap-2 text-light-3">
                      <p className="subtle-semibold lg:small-regular">{post && timeAgo(post.$createdAt)}</p>
                      -
                      <p className="subtle-semibold lg:small-regular">{post?.location}</p>
                    </div>
                  </div>
                </Link>

                <div className="flex-center gap-4">
                  <Link to={`/update-post/${post?.$id}`} className={`${user.id !== post?.creator.$id && 'hidden'}`}>
                    <img src="/assets/icons/edit.svg" alt="edit" width={24} height={24} />
                  </Link>
                  <Button
                    onClick={() => handleDeletePost(post?.$id || '', post?.imageId || '')}
                    variant="ghost"
                    className={`${user.id !== post?.creator.$id && 'hidden'}`}
                  >
                    <img src="/assets/icons/delete.svg" alt="delete" width={24} height={24} />
                  </Button>
                </div>
              </div>

              <hr className="border w-full border-dark-4/80" />

              <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
                <p>{post?.caption}</p>
                <ul className="flex flex-col lg:flex-row gap-1 mt-2">
                  {
                    post?.tags?.map((tag: string) => (
                      <li key={tag} className="text-light-3 mr-1">#{tag}</li>
                    ))
                  }
                </ul>
              </div>
              <div className="w-full">
                <PostStats post={post} userId={user.id} />
              </div>
            </div>
          </div>
        )
      }
      <div className="w-full">
        <h2 className="text-xl underline mb-4">Comments</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input className="shad-input w-full" placeholder="Enter a comment" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="shad-button_primary">Post comment</Button>
          </form>
        </Form>
        <div className="mt-6">
          {isCommentsLoading ? (
            <Loader />
          ) : (
            <ul>
              {postComments?.documents.map((comment) => (
                <li key={comment.$id} className="flex justify-between items-baseline mt-3">
                  <div className="flex items-start gap-3 w-full p-2 rounded-xl">
                    <img className="w-8 h-8 rounded-full" src={comment.userImage} alt="c" />
                    <div className="bg-gray-800 w-full pt-1 px-3 pb-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{comment.userName}</h4>
                        <p className="text-xs">{convertTime(comment.$createdAt)}</p>
                      </div>
                      <p className="text-sm mt-1 text-gray-400">{comment.comment}</p>

                    </div>
                  </div>
                </li>

              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetails
