
interface ArticleCardMetaProps {
  author: string;
  createdAt: string;
  formatDate: (dateString: string) => string;
}

const ArticleCardMeta = ({ author, createdAt, formatDate }: ArticleCardMetaProps) => {
  return (
    <p className="text-muted-foreground text-sm mb-2">
      By {author} • {formatDate(createdAt)}
    </p>
  );
};

export default ArticleCardMeta;
