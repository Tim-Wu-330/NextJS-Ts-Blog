import { FC } from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

interface Props {
  url: string;
  title: string;
  quote: string;
}

const Share: FC<Props> = ({ url, title, quote }): JSX.Element => {
  return (
    <div className="flex items-center space-x-3">
      <p className="font-semibold text-primary-dark dark:text-primary">
        Share:
      </p>
      <FacebookShareButton url={url} quote={quote} title={title}>
        <FacebookIcon round size={32} />
      </FacebookShareButton>

      <LinkedinShareButton url={url} source={quote} title={title}>
        <LinkedinIcon round size={32} />
      </LinkedinShareButton>

      <WhatsappShareButton url={url} title={title} separator=":: ">
        <WhatsappIcon round size={32} />
      </WhatsappShareButton>

      <RedditShareButton url={url} quote={quote} title={title}>
        <RedditIcon round size={32} />
      </RedditShareButton>
    </div>
  );
};

export default Share;
