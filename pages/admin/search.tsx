import { NextPage } from "next";
import AdminLayout from "../../components/layout/AdminLayout";
import { useRouter } from "next/router";
import axios from "axios";
import { useEffect, useState } from "react";
import { PostDetail } from "../../utils/types";
import InfiniteScrollPosts from "../../components/common/InfiniteScrollPosts";
import { filterPosts } from "../../utils/helper";

interface Props {}

const Search: NextPage<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [results, setResults] = useState<PostDetail[]>([]);
  const { query } = useRouter();
  const title = query.title as string;

  const handleSearch = async () => {
    try {
      setLoading(true);
      const { data } = await axios("/api/posts/search?title=" + title);
      setLoading(false);
      console.log(data);
      setResults(data.results);
      if (!data.results.length) setNotFound(true);
      else setNotFound(false);
    } catch (error: any) {
      console.log("error while searching: ", error.message);
    }
  };
  useEffect(() => {
    if (loading) return;
    handleSearch();
  }, [title]);
  return (
    <AdminLayout>
        {notFound ? (<h1 className="text-center text-3xl font-semibold text-secondary opacity-40">
            Not Found: (
        </h1>) : null}
        {loading ? (<h1 className="text-center text-3xl font-semibold text-secondary-dark opacity-40"> Searching </h1>) : null}
      <InfiniteScrollPosts
        hasMore={false}
        next={() => {}}
        dataLength={results.length}
        posts={results}
        showControls
        onPostRemoved={(post) =>
          setResults(filterPosts(results, post))
        }
      />
    </AdminLayout>
  );
};

export default Search;
