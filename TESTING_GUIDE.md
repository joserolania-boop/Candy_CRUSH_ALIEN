# 🧪 Story Campaign Testing Guide

## Quick Start

1. **Start Server**:
```bash
cd "C:\Users\Admin\OneDrive\Escritorio\MCP SERVER\Candy Crush Alien"
python -m http.server 8000
```

2. **Open Browser**: http://localhost:8000

3. **Click "Play"** button

---

## Testing Checklist

### ✅ Level 1: Intro Scene
- [ ] Intro story scene plays automatically (Mothership descending)
- [ ] Scene has starfield background
- [ ] Mothership hexagon glows and floats
- [ ] Narrative text is readable and centered
- [ ] "Continue" button works
- [ ] Scene closes with fade effect after clicking

### ✅ Gameplay - Level 1
- [ ] HUD shows: Score, Moves (30), Level (1)
- [ ] HUD shows Objective: "Score: 0/300"
- [ ] Objective progress updates as you match pieces
- [ ] Matches create sound effects
- [ ] Board renders correctly

### ✅ Level Completion
- [ ] When Score reaches 300, level completes automatically
- [ ] Pop-in overlay shows: "🎉 LEVEL 2" with animation
- [ ] Shows level name: "City Defense"
- [ ] Shows act info: "Act 1 - Mission 2/5"
- [ ] Shows new objective: "Pieces: 0/15"
- [ ] Overlay fades and transitions to Level 2

### ✅ Levels 2-5 Progression
- [ ] Each level has different objectives
- [ ] Level 5 completes normally
- [ ] After Level 5, automatically transitions to Level 6

### ✅ Level 6: Act 2 Scene
- [ ] Act 2 story scene plays (Alien fighters attacking)
- [ ] Scene shows aliens descending, defense structures, magic blasts
- [ ] Animation loops smoothly
- [ ] Narrative explains the invasion intensifies

### ✅ Levels 7-10 Progression
- [ ] Objectives are challenging but achievable
- [ ] Themes remain consistent (Violet Nebula)
- [ ] Level 10 completes, transitions to Level 11

### ✅ Level 11: Act 3 Scene
- [ ] Act 3 story scene plays (Base exploding)
- [ ] Scene shows explosion with concentric rings
- [ ] Narrative explains counter-attack strategy

### ✅ Levels 12-15 Progression
- [ ] More complex objectives (power-ups, pieces)
- [ ] Themes change to Azure Veil (cyan/light blue)
- [ ] Level 15 transitions to 16

### ✅ Level 16: Act 4 Scene
- [ ] Act 4 story scene plays (Artifact glowing on moon)
- [ ] Scene shows moon with craters, glowing artifact at center
- [ ] Light rays pulse from artifact
- [ ] Narrative reveals aliens were fleeing

### ✅ Levels 17-20 Progression
- [ ] Objectives increase in difficulty
- [ ] Themes change to Midnight (dark purples)
- [ ] Level 20 transitions to 21

### ✅ Level 21: Act 5 Scene
- [ ] Act 5 story scene plays (Peace alliance)
- [ ] Scene shows human base (left), alien base (right)
- [ ] Bridge of light connects them
- [ ] Handshake animation pulses
- [ ] Narrative unites both civilizations

### ✅ Levels 22-25: Final Campaign
- [ ] Levels have epic objectives
- [ ] Level 25 is the "Final Battle" with score target 3500
- [ ] Theme changes to Cosmic (multicolor)

### ✅ Victory
- [ ] After Level 25 completes, victory scene plays
- [ ] Celebration with orbiting stars
- [ ] Final score displayed
- [ ] Option to restart campaign

---

## Story Scene Details

### Scene 1: Intro (Level 1)
```
Visual: Mothership descending
Animation: Hexagon floats up and down with glow pulse
Sound: (Can add ambient sci-fi sound)
Text: "The stars are dark today..."
```

### Scene 2: Act 2 (Level 6)
```
Visual: Alien fighters descending on city
Animation: Triangles fall down, magic blasts rise
Sound: (Can add laser/impact sounds)
Text: "The aliens are attacking our cities!..."
```

### Scene 3: Act 3 (Level 11)
```
Visual: Base explosion
Animation: Orange explosion with concentric rings
Sound: (Can add explosion sound effect)
Text: "We're counterattacking their bases!..."
```

### Scene 4: Act 4 (Level 16)
```
Visual: Moon with glowing artifact
Animation: Magenta star pulses, light rays shine
Sound: (Can add mystical hum)
Text: "Wait... these artifacts... I think I understand..."
```

### Scene 5: Act 5 (Level 21)
```
Visual: Handshake of light between civilizations
Animation: Bridge glows, handshake pulses, bases glow
Sound: (Can add peaceful chord)
Text: "Humans and aliens—united by candy magic..."
```

### Scene 6: Victory (After Level 25)
```
Visual: Celebration with stars
Animation: Gold stars orbit and bounce
Sound: (Can add victory fanfare)
Text: "You saved us all. The worlds are safe."
```

---

## Objective Types

### Score-based
- Most common in early game
- Example: "Score 300" - accumulate points by matching
- Difficulty: Low (just match naturally)

### Pieces-based
- Clear specific number of tiles
- Example: "Clear 25 pieces"
- Difficulty: Medium (requires focus)

### Power-ups-based
- Create X power-ups via 4-in-a-row, 5-in-a-row, etc.
- Example: "Create 7 power-ups"
- Difficulty: Medium-High (requires pattern planning)

### Combo-based
- Achieve X power-ups in limited moves
- Example: "3 combos in 30 moves"
- Difficulty: High (requires both luck and strategy)

### Epic-based
- Ultimate challenge
- Example: "Score 3500"
- Difficulty: Extreme (only available on final level)

---

## LocalStorage Keys

Check in DevTools (F12 → Application → Local Storage):

```javascript
// Current level
localStorage.getItem('candy_current_level')  // → "1" to "25"

// Seen story scenes (prevent duplicate displays)
localStorage.getItem('candy_seen_stories')   // → {"intro":true, "act2":true, ...}

// Selected theme
localStorage.getItem('candy_bg_theme')       // → "deep", "violet", "azure", etc.

// Game stats
localStorage.getItem('candy_game_stats')     // → {totalMatches, totalScore, etc.}
```

---

## Performance Checklist

- [ ] SVG animations render smoothly (60fps)
- [ ] Story scene transitions are fast (<1s fade)
- [ ] No lag when rendering 25+ levels
- [ ] localStorage doesn't cause slowdown
- [ ] Memory usage stays reasonable

---

## Bug Testing

### Potential Issues to Check

1. **Story Scene Not Showing**
   - Check console for errors (F12)
   - Verify `story_checkpoint` field in LEVELS
   - Check if localStorage is available

2. **Objective Not Updating**
   - Watch console logs for onChange events
   - Verify objective display element exists (id="objective-display")
   - Check if `currentObjective` is initialized

3. **Level Not Advancing**
   - Check if objective is achievable
   - Verify moves are enough to reach target
   - Check console for errors in levelUp()

4. **Theme Not Changing**
   - Verify theme in LEVELS definition
   - Check if `data-theme` attribute is applied to body
   - Clear localStorage and try again

5. **Story Scenes Repeating**
   - Check localStorage `candy_seen_stories` 
   - Should only show once per checkpoint
   - Restart browser to test again

---

## Performance Testing

### Measure Load Time
```javascript
// In browser console
performance.mark('game-start')
// Play through level
performance.mark('game-end')
performance.measure('gameplay', 'game-start', 'game-end')
console.table(performance.getEntriesByType('measure'))
```

### Monitor Memory
```javascript
// In browser console
setInterval(() => {
  if(performance.memory) {
    console.log('Memory:', Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB');
  }
}, 1000)
```

---

## Difficulty Balance

### Expected Clear Times (per level)

| Level | Target | Expected Time | Difficulty |
|-------|--------|---------------|-----------|
| 1-5 | Score 300-800 | 2-3 min | Easy |
| 6-10 | Mixed objectives | 3-4 min | Easy-Medium |
| 11-15 | Power-up focused | 4-5 min | Medium |
| 16-20 | High targets | 5-6 min | Medium-Hard |
| 21-25 | Epic objectives | 6-10 min | Hard |

**Adjust targets if:**
- Levels feel too easy (increase target by 20%)
- Levels feel impossible (decrease target by 20%)
- Moves are insufficient (add 2-3 moves)

---

## User Feedback Scenarios

### Good Signs ✅
- Player completes levels 1-5 feeling like they learned the game
- Story scenes are engaging but not intrusive
- Objectives feel challenging but achievable
- Theme changes feel natural with progression
- Victory scene feels rewarding

### Bad Signs ❌
- Player gets frustrated on level 3-4
- Story scenes feel too long or repetitive
- Objectives impossible even with perfect play
- Difficulty spikes are too sharp
- Victory feels anticlimactic

---

## Rapid Testing Script

```javascript
// Run in browser console to skip to specific level
level = 15;
score = 0;
objectiveProgress = 0;
startGame(false);
```

---

## Accessibility Checklist

- [ ] Text is readable (font size, contrast)
- [ ] Colors not the only way to indicate status
- [ ] Objectives explained clearly
- [ ] No flashing animations (accessibility concern)
- [ ] Keyboard navigation works

---

## That's it! 🎮

Ready to play through the full 25-level campaign with integrated story!

**Total Expected Playtime**: 30-40 minutes for full campaign
**Story Checkpoints**: 6 (every 5 levels)
**Unique Objectives**: 7 types across 25 levels

Report any bugs or gameplay balance issues!
