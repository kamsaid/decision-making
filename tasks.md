## Granular Step-by-Step Plan to Upgrade SeekHelp App (Cursor-Compatible)

### Phase 1: Visual Redesign (Liquid Glass UI)

1. **Create design tokens for updated color palette**
   - Start: Add colors to `tailwind.config.js`
   - End: Tokens for background, surface, glass, primary, text are defined and build compiles

2. **Typography Upgrade**
   - Start: Set global font to Inter, use `rem` units, `leading-relaxed`, consistent base sizing
   - End: UI renders clean, consistent typography

3. **Implement backdrop blur utility classes**
   - Start: Add `backdrop-blur` and `bg-opacity` to Tailwind utility stack
   - End: Styles available for use in components

4. **Create Persistent 2-Column Layout**
   - Start: Modify `layout.tsx` to show sidebar (form) and chat thread side-by-side
   - End: Chat is always visible; sidebar is collapsible

5. **Refactor chat message bubbles to use new tokens**
   - Start: Open `src/components/ui/chat.tsx`
   - End: Bubbles have rounded corners, shadow, backdrop blur, and color tokens

6. **Add typing indicator animation**
   - Start: Create animated dot component
   - End: Typing dots appear when `isTyping` state is true

7. **Apply subtle fade-in animation to new messages**
   - Start: Add `motion.div` (Framer Motion) wrapper to messages
   - End: Messages animate in on addition

8. **Enable dark/light mode toggle**
   - Start: Install/use `useTheme` hook
   - End: App respects user theme + has manual toggle button in header

---

### Phase 2: Chat UX Improvements

9. **Move Decision Form into Sidebar**
   - Start: Place `DecisionForm` inside accordion sidebar using `Accordion.Root`
   - End: Collapsible sections with dynamic inputs working

10. **Add Styled Message Bubbles**
    - Start: Build `<ChatBubble />` components for user and assistant messages
    - End: Clean, styled chat UI with proper roles

11. **Add Typing Indicator**
    - Start: Show animated typing dots while assistant is responding
    - End: Dots appear only while loading

12. **Replace static input with smart input bar**
    - Start: Refactor input area to its own `ChatInput.tsx`
    - End: Supports enter-to-send, emoji button (placeholder), and autosize textarea

13. **Add Slash Command Parser**
    - Start: Enable `/pref`, `/con`, `/reset` commands from chat input
    - End: Typing `/pref health` modifies state as expected

14. **Auto-scroll chat view on new message**
    - Start: Add ref and `useEffect` in `chat.tsx`
    - End: Latest message always visible on send/receive

15. **Enable Streaming Chat Responses**
    - Start: Update `/api/chat` to use `ReadableStream` for chunked AI responses
    - End: Responses appear progressively in chat bubble

16. **Add Feedback on Assistant Messages**
    - Start: Add thumbs up/down buttons under each assistant response with optional comment box
    - End: Feedback UI appears and logs data (console or Supabase)

17. **Differentiate user/assistant messages clearly**
    - Start: Update styling logic in chat message component
    - End: Visual difference in bubble color, alignment, sender avatar

---

### Phase 3: AI Prompt + Backend

18. **Replace system prompt with new Clarity coach prompt** ✅ COMPLETED
    - Start: Paste prompt into `buildSystemMessage()`
    - End: Prompt includes delimiters, empathy-first, max 250-word output

19. **Add follow-up question injection logic**
    - Start: Add hook to detect end of response + insert suggestion
    - End: Assistant ends most answers with simple follow-up

20. **Chunk user context and only re-send deltas**
    - Start: Track context in session state
    - End: Only send new preferences/constraints in follow-ups

21. **Upgrade recommendation pipeline to use LangGraph** (optional advanced)
    - Start: Set up LangGraph orchestrator + workers for preference, constraint, creative
    - End: Final recommendation from synthesis node

---

### Phase 4: Frontend Form Enhancements

22. **Add progressive disclosure to form**
    - Start: Wrap preference/constraint sections in `Accordion`
    - End: Sections collapsed by default, user can expand

23. **Implement real-time form validation**
    - Start: Use `zod` + `react-hook-form` for typed field validation
    - End: Inputs show inline errors as user types

24. **Display form submit state (loading/spinner)**
    - Start: Add `isSubmitting` state
    - End: Button shows spinner + disables during submission

25. **Add Canvas View Toggle**
    - Start: Build drawer component that shows structured decision summary
    - End: Toggle opens context/preference/constraint view

26. **Implement Autosave Draft to LocalStorage**
    - Start: Use debounce to save chat input or form data every 500ms
    - End: Reload restores last draft automatically

27. **Add Reset Button**
    - Start: Add button to clear chat thread and form state
    - End: Clicking resets entire session

---

### Phase 5: Observability & Performance

28. **Add console logs with timestamps for API stages**
    - Start: Add `console.time` and `console.timeEnd` in `/api/recommendations`
    - End: Logs show timing for orchestrator, workers, synthesis

29. **Track frontend event logs with PostHog**
    - Start: Add `posthog.capture()` on form submit, chat send, recommendation click
    - End: Events show up in PostHog dashboard

30. **Enable edge deployment for chat and recommendation APIs**
    - Start: Add `export const runtime = 'edge'` to both endpoints
    - End: Confirm routes are running from Vercel Edge

---

### Phase 6: Final Polish

31. **Create a welcome screen with onboarding tips**
    - Start: Add `/onboarding` route with 2-3 short tips/slides
    - End: New users see onboarding before decision form

32. **Add app metadata + SEO tags**
    - Start: Update `head.tsx` with title, description, og:image
    - End: Link preview renders on social + SEO score passes

33. **Test mobile responsiveness of all views**
    - Start: Open dev tools → iPhone viewport
    - End: Form, chat, recommendations all usable on mobile

34. **Write README.md onboarding section**
    - Start: Add `Getting Started` and `Dev commands`
    - End: Team can spin up full-stack in 1 command

---

You now have 34 testable units ready to pass into Cursor one-by-one. Each can be run, verified, and iterated upon independently. Let me know if you want them turned into individual Cursor prompts!
