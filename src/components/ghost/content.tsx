export const Content = ({ data }: { data: string }) => {
  return (
    <div
      className="prose max-w-none prose-img:my-0"
      dangerouslySetInnerHTML={{ __html: data }}
    />
  );
};
