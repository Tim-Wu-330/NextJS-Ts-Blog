import { NextApiHandler } from "next";
import dbConnect from "../../../lib/dbConnect";
import Post from "../../../models/Post";
import { formatPosts, isAdmin } from "../../../lib/utils";

// https://wu-devblog.vercel.app/

const handler: NextApiHandler = async (req, res) => {
    if (req.method !== "GET") return res.status(404).send('Not Found')
    
    const admin = await isAdmin(req, res)
    if (!admin) return res.status(403).json({error: "Unauthorized access!"})

    const title =  req.query.title as string

    if(!title.trim()) return res.status(400).json({error: 'Invalid search query!'})
    

    await dbConnect();
    
    const posts = await Post.find({title: { $regex:title, $options:"i"}})
    res.json({ results: formatPosts(posts)})
}


export default handler 