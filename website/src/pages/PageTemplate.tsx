import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MenuItem, PageContent, StateSetter, User } from "../misc/models";
import { fetchPageContent, setTitle } from "../misc/util";

export default function PageTemplate({
  pageData,
  reload,
  lang,
  setUser,
}: {
  pageData: MenuItem;
  reload: boolean;
  lang: string;
  setUser: StateSetter<User | null>;
}) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  const location = useLocation();

  const fetchContent = () =>
    fetchPageContent(pageData.id, lang, setPageContent, setUser);

  useEffect(() => {
    if (reload) fetchContent();
  }, [reload]);

  useEffect(() => {
    fetchContent();
  }, [lang, location]);

  useEffect(() => {
    setTitle(pageData.title);
  }, [pageData]);

  return (
    <div
      className="text"
      dangerouslySetInnerHTML={{ __html: pageContent?.content ?? "" }}
    ></div>
  );
}
