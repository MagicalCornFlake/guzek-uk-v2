import type { TvShowList } from "@/lib/types";
import { TvShowPreviewList } from "@/components/liveseries/tv-show-preview-list";
import { serverToApi } from "@/lib/backend/server";
import { getTranslations } from "@/lib/providers/translation-provider";
import { getTitle } from "@/lib/util";

export async function generateMetadata() {
  const { data } = await getTranslations();
  return {
    title: getTitle(data.liveSeries.mostPopular.title, data.liveSeries.title),
  };
}

export default async function MostPopular({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { data, userLanguage } = await getTranslations();
  const params = await searchParams;

  const result = await serverToApi<TvShowList>("most-popular", {
    api: "episodate",
    params: { page: params.page || "1" },
  });

  return (
    <>
      <h2 className="my-6 text-3xl font-bold">
        {getTitle(
          data.liveSeries.mostPopular.title,
          data.liveSeries.title,
          false,
        )}
      </h2>
      <TvShowPreviewList
        userLanguage={userLanguage}
        tvShows={result.ok ? result.data : undefined}
        searchParams={params}
      />
    </>
  );
}
