import Link from "next/link";
import { useLiveSeries } from "@/context/liveseries-context";
import { useTranslations } from "@/context/translation-context";
import { useSearchParams } from "next/navigation";

const pagePattern = /page=\d+/;

export default function PageIndicator({
  page,
  currentPage,
  direction,
  disabled = false,
}: {
  page?: number;
  currentPage: number;
  direction?: "PREVIOUS" | "NEXT";
  disabled?: boolean;
}) {
  const searchParams = useSearchParams();
  const { data } = useTranslations();
  let loading = [];
  try {
    ({ loading } = useLiveSeries());
  } catch (error) {
    console.warn("PageIndicator is not inside a LiveSeriesProvider");
    console.error(error);
  }

  function getNewSearchParams() {
    const search = searchParams.toString();
    const newFragment = `page=${page}`;
    if (!search) return newFragment;
    if (search.match(pagePattern))
      return search.replace(pagePattern, newFragment);
    return search + "&" + newFragment;
  }
  let displayValue;

  if (null == page) {
    if (!direction) return <div className="page-indicator disabled">...</div>;
    [displayValue, page] =
      direction === "PREVIOUS"
        ? ["<", currentPage - 1]
        : [">", currentPage + 1];
  } else {
    displayValue = data.numberFormat.format(page);
  }

  return (
    <Link
      href={disabled ? "#" : "?" + getNewSearchParams()}
      className={`page-indicator serif ${
        disabled ? "disabled" : page === currentPage ? "current-page" : ""
      } ${direction ? "auxiliary" : ""}`}
      onClick={(evt) => {
        (loading.length > 0 || disabled) && evt.preventDefault();
      }}
    >
      {displayValue}
    </Link>
  );
}
