## Granular Step-by-Step Plan to Upgrade SeekHelp App (Cursor-Compatible)

### Phase 1: Visual Redesign (Liquid Glass UI)

1. **Create design tokens for updated color palette**
   - Start: Add colors to `tailwind.config.js`
   - End: Tokens for background, surface, glass, primary, text are defined and build compiles

2. **Implement backdrop blur utility classes**
   - Start: Add `backdrop-blur` and `bg-opacity` to Tailwind utility stack
   - End: Styles available for use in components

3. **Refactor chat message bubbles to use new tokens**
   - Start: Open `src/components/ui/chat.tsx`
   - End: Bubbles have rounded corners, shadow, backdrop blur, and color tokens

4. **Add typing indicator animation**
   - Start: Create animated dot component
   - End: Typing dots appear when `isTyping` state is true

5. **Apply subtle fade-in animation to new messages**
   - Start: Add `motion.div` (Framer Motion) wrapper to messages
   - End: Messages animate in on addition

6. **Enable dark/light mode toggle**
   - Start: Install/use `useTheme` hook
   - End: App respects user theme + has manual toggle button in header

---

### Phase 2: Chat UX Improvements

7. **Replace static input with smart input bar**
   - Start: Refactor input area to its own `ChatInput.tsx`
   - End: Supports enter-to-send, emoji button (placeholder), and autosize textarea

8. **Auto-scroll chat view on new message**
   - Start: Add ref and `useEffect` in `chat.tsx`
   - End: Latest message always visible on send/receive

9. **Stream assistant responses in real-time**
   - Start: Modify chat API handler to return stream
   - End: Messages appear word-by-word like ChatGPT

10. **Differentiate user/assistant messages clearly**
   - Start: Update styling logic in chat message component
   - End: Visual difference in bubble color, alignment, sender avatar

---

### Phase 3: AI Prompt + Backend

11. **Replace system prompt with new Clarity coach prompt** ✅ COMPLETED
   - Start: Paste prompt into `buildSystemMessage()`
   - End: Prompt includes delimiters, empathy-first, max 250-word output

12. **Add follow-up question injection logic**
   - Start: Add hook to detect end of response + insert suggestion
   - End: Assistant ends most answers with simple follow-up

13. **Chunk user context and only re-send deltas**
   - Start: Track context in session state
   - End: Only send new preferences/constraints in follow-ups

14. **Upgrade recommendation pipeline to use LangGraph** (optional advanced)
   - Start: Set up LangGraph orchestrator + workers for preference, constraint, creative
   - End: Final recommendation from synthesis node

---

### Phase 4: Frontend Form Enhancements

15. **Add progressive disclosure to form**
   - Start: Wrap preference/constraint sections in `Accordion`
   - End: Sections collapsed by default, user can expand

16. **Implement real-time form validation**
   - Start: Use `zod` + `react-hook-form` for typed field validation
   - End: Inputs show inline errors as user types

17. **Display form submit state (loading/spinner)**
   - Start: Add `isSubmitting` state
   - End: Button shows spinner + disables during submission

---

### Phase 5: Observability & Performance

18. **Add console logs with timestamps for API stages**
   - Start: Add `console.time` and `console.timeEnd` in `/api/recommendations`
   - End: Logs show timing for orchestrator, workers, synthesis

19. **Track frontend event logs with PostHog**
   - Start: Add `posthog.capture()` on form submit, chat send, recommendation click
   - End: Events show up in PostHog dashboard

20. **Enable edge deployment for chat and recommendation APIs**
   - Start: Add `export const runtime = 'edge'` to both endpoints
   - End: Confirm routes are running from Vercel Edge

---

### Phase 6: Final Polish

21. **Create a welcome screen with onboarding tips**
   - Start: Add `/onboarding` route with 2-3 short tips/slides
   - End: New users see onboarding before decision form

22. **Add app metadata + SEO tags**
   - Start: Update `head.tsx` with title, description, og:image
   - End: Link preview renders on social + SEO score passes

23. **Test mobile responsiveness of all views**
   - Start: Open dev tools → iPhone viewport
   - End: Form, chat, recommendations all usable on mobile

24. **Write README.md onboarding section**
   - Start: Add `Getting Started` and `Dev commands`
   - End: Team can spin up full-stack in 1 command

---

You now have 24 testable units ready to pass into Cursor one-by-one. Each can be run, verified, and iterated upon independently. Let me know if you want them turned into individual Cursor prompts!
