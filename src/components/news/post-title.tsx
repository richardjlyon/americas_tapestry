interface PostTitleProps {
  title: string;
}

export function PostTitle({ title }: PostTitleProps) {
  return <h1 className="page-heading">{title}</h1>;
}
