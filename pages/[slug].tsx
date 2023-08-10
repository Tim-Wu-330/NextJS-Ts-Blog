import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import parse from "html-react-parser";
import DefaultLayout from "../components/layout/DefaultLayout";
import dbConnect from "../lib/dbConnect";
import Post from "../models/Post";
import Image from "next/image";
import dateFormat from "dateformat";
import Comments from "../components/common/Comments";
import { useCallback, useEffect, useState } from "react";
import LikeHeart from "../components/common/LikeHeart";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import { signIn } from "next-auth/react";
import User from "../models/User";
import AuthorInfo from "../components/common/AuthorInfo";


type Props = InferGetStaticPropsType<typeof getStaticProps>;

const SinglePost: NextPage<Props> = ({ post }) => {
  const [likes, setLikes] = useState({ likedByOwner: false, count: 0})
  const { id, title, content, tags, meta, slug, thumbnail, createdAt, author } = post;

  const user = useAuth()

  const getLikeLabel = useCallback((): string => {
    const {likedByOwner, count} = likes;
    if (likedByOwner && count === 1) return "You liked this post.";
    if (likedByOwner) return `You and ${count - 1} other likes this post.`
    
    if (count === 0) return 'Like post.'

    return count + ' people liked this post.'

  }, [likes]);

  const handleOnLikeClick = async () => {
  try { 
    if(!user) return await signIn('github');
    const {data} = await axios.post(`/api/posts/update-like?postId=${id}`)
    setLikes({likedByOwner: !likes.likedByOwner, count: data.newLikes})
  } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    axios(`/api/posts/like-status?postId=${id}`).then(({data}) => setLikes({likedByOwner: data.likedByOwner, count: data.likesCount})).catch((err) => console.log(err))
  }, [])

  return (
    <DefaultLayout title={title} desc={meta}>
      <div className="lg:px-0 px-3">
        {thumbnail ? (
          <div className="relative aspect-video">
            <Image src={thumbnail} alt={title} layout="fill" />
          </div>
        ) : null}

        <h1 className="text-6xl font-semibold text-primary-dark dark:text-primary py-2">
          {title}
        </h1>

        <div className="flex items-center justify-between py-2 text-secondary-dark dark:text-secondary-light">
          {tags.map((t, index) => (
            <span key={t + index}>#{t}</span>
          ))}
          <span>{dateFormat(createdAt, "d-mmm-yyyy")}</span>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-full mx-auto">
          {parse(content)}
        </div>
          <div className="py-10">
            <LikeHeart liked={likes.likedByOwner} label={getLikeLabel()} onClick={handleOnLikeClick}/>
          </div>
          <div className="pt-10">
            <AuthorInfo profile={JSON.parse(author)}/>
          </div>
        <Comments belongsTo={id} />
      </div>
    </DefaultLayout>
  );
};

export default SinglePost;

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    await dbConnect();
    const posts = await Post.find().select("slug");
    const paths = posts.map(({ slug }) => ({ params: { slug } }));
    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    return {
      paths: [{ params: { slug: "/" } }],
      fallback: false,
    };
  }
};

interface StaticPropsResponse {
  post: {
    id: string;
    title: string;
    content: string;
    meta: string;
    tags: string[];
    slug: string;
    thumbnail: string;
    createdAt: string;
    author: string;
  };
}

export const getStaticProps: GetStaticProps<
  StaticPropsResponse,
  { slug: string }
> = async ({ params }) => {
  try {
    await dbConnect();
    const post = await Post.findOne({ slug: params?.slug }).populate('author');
    if (!post) return { notFound: true };

    const { _id, title, content, meta, slug, tags, author, thumbnail, createdAt } =
      post;
    const admin = await User.findOne({ role: "admin"});
    const authorInfo = (author || admin) as any

    const postAuthor = {   
      id: authorInfo._id,
      name: authorInfo.name,
      avatar: authorInfo.avatar,
      message: `This post is written by ${authorInfo.name}. ${authorInfo.name.split(' ')[0]} is an full stack JavaScript developer. You can find him on linkedin`
    }
    console.log(postAuthor)

    return {
      props: {
        post: {
          id: _id.toString(),
          title,
          content,
          meta,
          slug,
          tags,
          thumbnail: thumbnail?.url || "",
          createdAt: createdAt.toString(),
          author: JSON.stringify(postAuthor),
          // author: postAuthor,
        },
      },
      revalidate: 60,
    };
  } catch (error) {
    return { notFound: true };
  }
};
