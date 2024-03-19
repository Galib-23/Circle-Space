import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );
        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name);
        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        })
        return newUser;
    } catch (error) {
        console.log(error);
        return error;
    }
}
export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )
        return newUser;
    } catch (error) {
        console.log(error);
    }
}

export async function signInAccount(user: { email: string; password: string; }) {
    try {
        const session = await account.createEmailSession(user.email, user.password);
        return session;
    } catch (error) {
        console.log(error)
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if (!currentUser) throw Error;
        return currentUser.documents[0];

    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.log(error)
    }
}

export async function createPost(post: INewPost) {
    try {
        //upload image to storage
        const uploadedFile = await uploadFile(post.file[0]);
        if (!uploadedFile) throw Error;

        //get file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        const tags = post.tags?.replace(/ /g, '').split(',') || [];

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags
            }
        )
        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }
        return newPost;

    } catch (error) {
        console.log(error)
    }
}

export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.log(error)
    }
}
//=================  GET FILE URL ==================== 
export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        )

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log(error)
    }
}
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: 'ok' }
    } catch (error) {
        console.log(error)
    }
}

export async function getRecentPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(20)]
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }

}

////========= LIKE AND SAVES AND DELETE SAVES =============== //////
export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )
        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error)
    }
}
export async function savePost(postId: string, userId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId
            }
        )
        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error)
    }
}

export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )
        if (!statusCode) throw Error;

        return { status: 'ok' };
    } catch (error) {
        console.log(error)
    }
}

export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        return post;
    } catch (error) {
        console.log(error)
    }
}

export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;
    try {
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId
        }
        if (hasFileToUpdate) {
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error;
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }
            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
        }
        const tags = post.tags?.replace(/ /g, '').split(',') || [];
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags
            }
        )
        if (!updatedPost) {
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }
            throw Error;
        }
        if (hasFileToUpdate) {
            await deleteFile(post.imageId);
        }
        return updatedPost;

    } catch (error) {
        console.log(error)
    }
}

export async function deletePost(postId: string, imageId: string) {
    if (!postId || !imageId) throw Error;
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        await deleteFile(imageId);
        return { status: 'ok' };
    } catch (error) {
        console.log(error)
    }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)];
    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries,
        )
        if (!posts) throw Error;
        return posts;
    } catch (error) {
        console.log(error)
    }
}
export async function searchPosts(searchTerm: string) {

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)],
        )
        if (!posts) throw Error;
        return posts;
    } catch (error) {
        console.log(error)
    }
}

export async function getUsers() {
    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(10)]
        );
        if (!users) throw Error;
        return users;
    } catch (error) {
        console.log(error)
    }
}


export async function getSavedPosts() {
    try {
        const savedPost = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            [Query.orderDesc("$createdAt")],
        )
        if (!savedPost) throw Error;
        return savedPost;
    } catch (error) {
        console.log(error);
    }
}




export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
        let image = {
            imageUrl: user.imageUrl,
            imageId: user.imageId
        }
        if (hasFileToUpdate) {
            const uploadedFile = await uploadFile(user.file[0]);
            if (!uploadedFile) throw Error;
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }
            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
        }
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                bio: user.bio,
                imageUrl: image.imageUrl,
                imageId: image.imageId
            }
        )
        if (!updatedUser) {
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }
            throw Error;
        }
        if (user.imageId && hasFileToUpdate) {
            await deleteFile(user.imageId);
        }
        return updateUser;

    } catch (error) {
        console.log(error)
    }
}

export async function getUserById(userId: string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        if (!user) throw Error;

        return user;
    } catch (error) {
        console.log(error);
    }
}

export async function createMessage(message: string, sender: string, reciever: string) {
    try {
        const newMessage = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.messageCollectionId,
            ID.unique(),
            {
                messageBody: message,
                sender: sender,
                reciever: reciever
            }
        )
        if (!newMessage) throw Error;
        return newMessage;
    } catch (error) {
        console.log(error);
    }
}

// export async function getMessages() {
//     try {
//         const messages = await databases.listDocuments(
//             appwriteConfig.databaseId,
//             appwriteConfig.messageCollectionId,
//             [Query.orderDesc("$createdAt"), Query.limit(20)]
//         );
//         if (!messages) throw Error;
//         return messages;
//     } catch (error) {
//         console.log(error);
//     }
// }

export async function createComment(comment: string, userId: string, userName: string, postId: string, userImage: URL,){
    try {
        const newComment = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentCollectionId,
            ID.unique(),
            {
                comment: comment,
                userId: userId,
                userName: userName,
                postId: postId,
                userImage: userImage,
            }
        );
        if(!newComment) throw Error;
        return newComment;
    } catch (error) {
        console.log(error);
    }
}
export async function getComments(postId: string){
    try {
        const postComments = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.commentCollectionId,
            [Query.equal("postId", postId), Query.limit(20)],
        )
        if(!postComments) throw Error;
        return postComments;
    } catch (error) {
        console.log(error);
    }
}