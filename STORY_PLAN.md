# Candy Crush Alien - Story Campaign Plan

## 🎬 Narrative Structure
**Total Levels**: 25 (5 acts × 5 levels each)
**Story Checkpoints**: Every 5 levels (1, 6, 11, 16, 21)
**Animations**: 6 fullscreen story scenes (intro + 5 act transitions)
**Theme**: Defend Earth from alien invasion using magical candy powers

---

## 📖 Story Acts

### ACT 1: "The Invasion Begins" (Levels 1-5)
**Opening Scene** (Checkpoint at Level 1):
- Starfield background with alien mothership approaching Earth
- Alien commander appears: "Your candy magic is our last hope!"
- Mission briefing text
- Button: "Accept Mission"

**Act Summary**:
- Learn to match candies
- Establish the threat: aliens are coming
- Your magic is the only defense

**Level Objectives**:
1. **Level 1**: TUTORIAL - Score 300 (Match candies to learn)
2. **Level 2**: Clear 15 pieces (First combat)
3. **Level 3**: Score 500 (Building power)
4. **Level 4**: Create 3 power-ups (Master combinations)
5. **Level 5**: Score 800 (Final prep) → CHECKPOINT

---

### ACT 2: "First Contact" (Levels 6-10)
**Checkpoint Scene** (Level 6):
- Alien fighters appear in formation
- Narrator: "They're attacking the cities!"
- Your magical grid starts glowing
- Animation: Wave of aliens approaching, you blast them with candy magic
- Button: "Defend Now"

**Act Summary**:
- Aliens raid coastal cities
- You push back their first wave
- New power-up types revealed (wrapped, colorbomb)

**Level Objectives**:
6. **Level 6**: Score 1000 (First wave defense) → CHECKPOINT
7. **Level 7**: Clear 20 pieces (City evacuation)
8. **Level 8**: Create 5 power-ups (Arsenal building)
9. **Level 9**: Score 1200 (Mid-battle)
10. **Level 10**: 25 moves to clear sector (Precision strike) → CHECKPOINT

---

### ACT 3: "Counter-Attack" (Levels 11-15)
**Checkpoint Scene** (Level 11):
- Military HQ shows tactical map
- Alien bases spotted on radar
- You coordinate with Earth defense forces
- Animation: Missiles and candy magic combined, alien base destroyed
- Narrator: "We're turning the tide!"
- Button: "Launch Offensive"

**Act Summary**:
- You coordinate with human military
- Destroy alien bases on Earth
- Discover their weakness to combined magic

**Level Objectives**:
11. **Level 11**: Score 1500 (Base assault) → CHECKPOINT
12. **Level 12**: Clear 25 pieces (Fortified position)
13. **Level 13**: Create 7 power-ups (Maximum firepower)
14. **Level 14**: Score 1800 (Strategic victory)
15. **Level 15**: 30 moves + 3 power-ups (Precision bombardment) → CHECKPOINT

---

### ACT 4: "The Artifact" (Levels 16-20)
**Checkpoint Scene** (Level 16):
- Deep space exploration sequence
- You detect ancient alien artifact hidden on moon
- Narrator: "This technology... it could change everything!"
- Animation: Moonscape, artifact glows, shows visions of alien civilization
- Character: "The artifacts hold the key to understanding them..."
- Button: "Study the Artifact"

**Act Summary**:
- Search for alien artifact
- Unlock ancient knowledge
- Learn aliens didn't choose war—they're fleeing something

**Level Objectives**:
16. **Level 16**: Score 2000 (Archaeological dig) → CHECKPOINT
17. **Level 17**: Clear 30 pieces (Deep excavation)
18. **Level 18**: Create 10 power-ups (Full magical potential)
19. **Level 19**: Score 2200 (Ancient knowledge)
20. **Level 20**: 35 moves + reach 100+ power-ups total (Master the ruins) → CHECKPOINT

---

### ACT 5: "The Truth & Alliance" (Levels 21-25)
**Checkpoint Scene** (Level 21):
- Flashback: Alien homeworld being destroyed by cosmic horror
- Aliens were refugees, not invaders
- Peace negotiation begins
- Animation: Human and alien leaders shaking hands, candy magic creates bridge of light
- Narrator: "Together, we are stronger than either fear or darkness"
- Button: "Forge Peace"

**Act Summary**:
- Aliens reveal they were fleeing something worse
- Humans and aliens form alliance
- Face the true threat together

**Level Objectives**:
21. **Level 21**: Score 2500 (First peace offering) → CHECKPOINT
22. **Level 22**: Clear 40 pieces (Shared sacrifice)
23. **Level 23**: Create 15 power-ups (Combined might)
24. **Level 24**: Score 3000 (United strength)
25. **Level 25**: 40 moves + epic final battle (Defeat the cosmic horror) → VICTORY

---

### FINAL: "Victory Celebration" (Post-Level 25)
**Ending Scene** (Unlocked after Level 25):
- Celebration on Earth with alien visitors
- Montage of restored cities
- You receive the title: "Defender of Two Worlds"
- Leaderboard unlocked
- Credits with story characters
- Button: "Play Again" → Returns to Level 1 with unlockable "Veteran" modifiers

---

## 🎨 Visual Themes Per Act

| Act | Theme Name | Colors | Mood |
|-----|-----------|--------|------|
| 1 | Cosmic Dawn | Deep blues, golds | Discovery |
| 2 | Battle Stations | Reds, oranges, yellows | Urgency |
| 3 | Victory Rise | Purples, greens | Triumph |
| 4 | Ancient Mystery | Dark purples, cyans | Wonder |
| 5 | Unified Horizon | Gold + multicolor | Peace |

---

## 📊 Level Difficulty Curve

```
Act 1: Score targets 300→500→800→1000 (Learning phase)
Act 2: Power-ups required, 20-25 pieces (Engagement phase)
Act 3: High scores 1500→2000, multiple objectives (Challenge phase)
Act 4: Complex objectives, 30+ pieces, 10+ power-ups (Expert phase)
Act 5: Ultimate challenge, 40 pieces, cosmic battle (Mastery phase)
```

---

## 🎯 Objective Types

1. **Score-based**: Reach X points (most levels)
2. **Pieces-based**: Clear X specific tiles or colors (mid-game)
3. **Power-up-based**: Create X power-ups or specific types (advanced)
4. **Moves-based**: Achieve objective in X moves (bonus challenge)
5. **Combo-based**: Achieve X power-ups in one turn (expert mode)

---

## 💾 Save System

```javascript
localStorage keys:
- "candy_story_progress": Current level (1-25)
- "candy_story_checkpoint": Last checkpoint viewed (1, 6, 11, 16, 21)
- "candy_story_seen": Set of scene IDs already viewed
- "candy_game_stats": Total matches, power-ups used, highest score
```

---

## 🎬 Story Scene Asset Requirements

| Scene | Duration | Type | Notes |
|-------|----------|------|-------|
| Intro | 8-10s | SVG/CSS Anim | Mothership descending |
| Act 2 Checkpoint | 6-8s | CSS Anim | Alien fighters + magic blast |
| Act 3 Checkpoint | 7-9s | SVG + CSS | Military base destruction |
| Act 4 Checkpoint | 8-10s | SVG Anim | Moon artifact glow |
| Act 5 Checkpoint | 10-12s | SVG + Lottie | Peace/alliance celebration |
| Victory | 12-15s | Full sequence | Credits & celebration |

---

## 🚀 Implementation Checklist

- [ ] Create LEVELS array with 25 entries (game.js)
- [ ] Add story_checkpoint field to levels 1, 6, 11, 16, 21
- [ ] Implement Goal tracking system (ui.js)
- [ ] Create Story module (story.js)
- [ ] Design story scenes (HTML templates or SVG)
- [ ] Implement scene triggers in levelUp() (game.js)
- [ ] Add localStorage persistence
- [ ] Create minimal animations (CSS or simple SVG)
- [ ] Test full campaign flow
- [ ] Polish transitions and pacing
- [ ] Add sound effects to story scenes

---

## 📝 Story Dialogue Snippets

**Intro**:
"The stars are dark today. A great ship approaches Earth. We don't know their intent, but we have one advantage: an ancient magic hidden in crystallized candy. Only you can wield it. Match, create, combine—your power is our hope."

**Act 2**:
"The aliens are attacking our cities! Use your magic to defend! Every combination of candies is a blast of protective energy!"

**Act 3**:
"We're counterattacking their bases! Stay focused. The military is with us. Together, magic and science will prevail!"

**Act 4**:
"Wait... these artifacts... I think I understand. The aliens... they're not our enemy. They were fleeing. Running from something in the void..."

**Act 5**:
"They call it 'The Devourer.' An ancient force that consumes worlds. Together—humans and aliens united by candy magic—we must stand against it. Are you ready?"

---

## 🎮 Gameplay Integration

Each story scene triggers:
1. Fullscreen overlay (no interaction possible)
2. 8-12 second animation/narrative
3. Auto-play or click to advance
4. Smooth transition to next level
5. Progress saved to localStorage
6. Stats merged into campaign totals

---

## 🏆 Post-Campaign Content

Once Level 25 is complete:
- Unlock "Veteran Mode" with harder modifiers
- Daily challenges using story themes
- Leaderboard showing campaign times
- New Game+ with cosmetic rewards
- Behind-the-scenes story epilogues

---

This creates a compelling narrative arc while maintaining core match-3 gameplay!
