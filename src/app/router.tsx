import { createBrowserRouter, Navigate } from "react-router-dom"

import { LeaderboardsPage } from "@/features/leaderboards/pages/leaderboards-page"
import { LearnPage } from "@/features/lessons/pages/learn-page"
import { LessonPlayerPage } from "@/features/lessons/pages/lesson-player-page"
import { ProfilePage } from "@/features/profile/pages/profile-page"
import { QuestsPage } from "@/features/quests/pages/quests-page"
import { ReviewPage } from "@/features/review/pages/review-page"
import { ShopPage } from "@/features/shop/pages/shop-page"
import { AppShell } from "@/routes/AppShell"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LearnPage /> },
      { path: "path", element: <Navigate to="/" replace /> },
      { path: "lesson/:lessonId", element: <LessonPlayerPage /> },
      { path: "leaderboards", element: <LeaderboardsPage /> },
      { path: "review", element: <ReviewPage /> },
      { path: "quests", element: <QuestsPage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
])
