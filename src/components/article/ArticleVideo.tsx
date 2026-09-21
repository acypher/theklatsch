interface ArticleVideoProps {
  src: string;
  title: string;
}

const ArticleVideo = ({ src, title }: ArticleVideoProps) => (
  <video
    key={src}
    src={src}
    aria-label={title}
    controls
    autoPlay={false}
    playsInline
    preload="metadata"
    className="w-full h-full object-contain bg-black"
  >
    Your browser does not support this video format. <a href={src}>Download video</a>
  </video>
);

export default ArticleVideo;
