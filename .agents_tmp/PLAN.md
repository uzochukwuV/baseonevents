# 1. OBJECTIVE

Create an Explore page (`/explore`) with large game cards featuring images and descriptions. Each card will be clickable and navigate to its dedicated game page (`/games/[slug]`) where users can play the game.

# 2. CONTEXT SUMMARY

- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS
- **Current State:** Landing page at `/` showing game info, no dedicated explore page
- **Repository:** GitHub (uzochukwuV/baseonevents)
- **Existing Games:** "Minority Wins" (Live), "Crown the Favourite" (Coming Soon)
- **Goal:** Add explore page + 3 new games (4 total games on launch)

# 3. APPROACH OVERVIEW

1. **Create shared game data structure** - Centralize game definitions with metadata (id, title, description, image, status, slug)
2. **Build Explore page** - Grid of large game cards with images and descriptions
3. **Create game page template** - Dynamic route `/games/[slug]` for individual games
4. **Add navigation** - Link explore page from navbar, make cards clickable
5. **Git workflow** - Commit changes, create branch, push, create PR

# 4. IMPLEMENTATION STEPS

## Step 1: Create Game Data Structure
- Create `web/lib/games.ts` with centralized game definitions
- Define Game interface: `{ id, slug, title, description, image, status, comingSoon }`
- Include placeholder data for all 4 games (2 existing + placeholders for 3 new)

## Step 2: Create Explore Page
- Create `web/app/explore/page.tsx`
- Display large card grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each card shows: game image, title, description, status badge
- Cards are clickable links to `/games/[slug]`
- Add "Explore" to navbar navigation

## Step 3: Create Game Page Template
- Create `web/app/games/[slug]/page.tsx` as a dynamic route
- Load game data by slug from game definitions
- Display game title, description, and placeholder for game content
- Add back navigation to explore page

## Step 4: Git Workflow
- Stage all new files
- Create branch: `feature/explore-page-and-games`
- Commit with descriptive message
- Push branch to origin
- Create pull request to main

## Step 5: Define 3 New Games (Placeholders)
For now, add placeholder entries for:
1. "Political Pulse" - Predict election outcomes
2. "Award Night" - Predict award show winners  
3. "Sports Bracket" - Predict tournament results

# 5. TESTING AND VALIDATION

- **Build Check:** `cd web && npm run build` should succeed
- **Explore Page:** Navigate to `/explore` and verify cards render
- **Game Pages:** Click any card → verify navigation to `/games/[slug]`
- **Responsive Design:** Test cards on mobile/tablet/desktop viewports
- **PR Created:** Pull request visible on GitHub with all changes
