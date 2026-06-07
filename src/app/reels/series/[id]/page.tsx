import { db } from "../../../../server/db";
import { reels } from "../../../../server/db/schemas/reels";
import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function SeriesRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const firstEpisode = await db.query.reels.findFirst({
    where: eq(reels.seriesId, id),
    orderBy: [asc(reels.episodeNumber)]
  });
  
  if (firstEpisode) {
     redirect(`/reels/${firstEpisode.id}?seriesId=${id}`);
  } else {
     redirect("/reels");
  }
}
