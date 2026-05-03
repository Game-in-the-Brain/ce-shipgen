# Mneme Space Combat — Core Mechanics

> **Source:** Mneme Variant Space Combat Rules v2.45 (Justin Aquino & Nicco Salonga)
> **Based on:** Cepheus Engine SRD

---

## 1. Target Number (TN)

Die Rolls in Cepheus Engine SRD page 14: the target number typically is **8+**, but this can vary.

In Mneme Space Combat:
- The character's modifiers are **separated**
- The **circumstance DM and the task affect the TN** instead
- The Referee can omit the TN if they cannot let the PC know if they succeed or fail

---

## 2. One-Roll Opposed Checks

In Mneme Space Combat, opposed rolls are **streamlined** to speed up gameplay.

Unlike CESRD page 15 where both parties roll, here **only the players roll**.
The Referee doesn't need to roll for NPCs.

### Formula

```
TN = 8 (Base TN) + Adversary's DM
```

Players roll **2D6 + relevant skill modifier** against this TN.

**Example:** If an opponent has a Gunner DM of +2, the player rolls against TN 10 (8+2).

### Types of Opposed Rolls

| Roll Type | TN Formula |
|-----------|------------|
| Point Defense | 8 + Attacker's Gunner DM |
| Dodge | 8 + Attacker's Gunner DM |
| EW / Break Lock | 8 + Adversary's Comms-Sensor or Gunner DM |
| Range Check | 8 + Adversary's Navigation DM |

### Reactions and Difficulty Modifiers

- **Reactions that increase difficulty:** If players take certain reactions, they receive a bonus to their opposed roll result. Conversely, if the enemy takes a reaction, it increases the TN for the roll.
- **Minor Actions or Reactions:** Parties wishing to oppose a roll must use up a Minor Action or Reaction to do so. If they choose not to oppose, the difficulty is reduced by 2.
  - Example: Missile Attack rolls without any Point Defense or Pilot Dodging would be against TN **6+** instead of 8+.

### Speeding Up Play: Players Roll for Adversaries

Players have the option to **roll for their adversaries and NPCs**, effectively reducing the number of rolls the Referee has to make during space combat to zero. However, Referees still have the option to roll for NPCs if they choose to.

---

## 3. Minimum Success Effect of 1

See Difficulty and Effect CESRD page 15 which puts success at an effect of 0.

In Mneme, a Success should have **at least an effect of 1**.

**Degree of Success** = (Check Result - Target Number) + 1

- Example: 2D6 + DM+1 rolling a 7 + DM+1 = 8, against TN 8: 8 - 8 = 0 + 1 = **Effect 1**

**Implications:**
- Effects determine additional Initiative
- A Successful Tactics Roll doesn't grant any Effect and thus no Initiative Advantage
- Effects determine additional DM+1s — a successful Coordinate Crew action with Effect 0 grants none
- This adds to all Successful Attacks to have a damage of at least 1

---

## 4. Double Effect Rolling 2 and 12

- Rolling a **12** naturally (6 on each die, before modifications): **double the effect** if positive (good), **halve it** if negative (bad)
- Rolling a **2** naturally (1 on each die): **double the effect** if negative, **halve it** if positive

**Example:** 2D6 DM+1 roll of 12 against TN 8:
- Total check result: 13
- Effect: 13 - 8 = 5
- Rolling 12 doubles it: **Effect 10**

**Applies to:**
- Opposed Check mechanics (apply modification to Effect before doubling)
- Weapon Damage which adds the roll's Effect

With these rules, Critical Hits and Misses have a higher effect on the game. In 2D6, extremes (2 or 12) are rolled at **2.77%** of the time.

---

## 5. Superiority

Superiority is for situations where multiple people/characters are working on the same task and where it would be inconvenient or absurd to roll for each of them separately.

It assumes that the number of people performing tasks does not add linearly — it takes more and more people to effectively help at the exact same action.

### How It Works

Any additional parties beyond the main characters aiding in a roll can be considered as adding to "Superiority".

- A **Superiority dice modifier** is added as a bonus to the PC's roll result if they have superior numbers and resources
- It is a **penalty** if the target or opposition has superior numbers and resources

**Resources counted:** Stations and Manpower
- Example: A ship with 2 Sensors and 1 NavComm officer vs. a squadron with 4 Sensors and 2 Officers — the squadron has superiority 2:1, giving DM+2 (or raising TN by 2)

### Superiority Table

| Superiority Ratio | Difficulty Modifier |
|-------------------|---------------------|
| Even (1:1) | 0 |
| 2:1 | ±1 |
| 3:1 | ±2 |
| 5:1 | ±3 |
| 7:1 | ±4 |
| 10:1 | ±5 |
| 15:1 | ±6 |
| 20:1 | ±7 |
| 30:1 | ±8 |
| 50:1 | ±9 |
| 100:1 | ±10 |
| 200:1 | ±11 |
| 500:1 | ±12 |

The Referee considers ships and their resources: **Ships, Turrets/Bays, Multiple Electronic Suites and Stations** as adding to Superiority.

### TL Superiority

A higher Tech Level side can gain superiority based on the TL difference.

---

## 6. Multiple Actions Clarified (CESRD p.48)

Attacks are grouped into one roll for each Significant Character in the Space Combat.

The Referee having limits in the NPCs they can manage — it's recommended to have up to **5 NPC gunner groups** to roll for, but ideally **2-3** would be best.

---

## 7. Attack Success Effect

See Minimum Success Effect of 1 (above). All successful attacks have a minimum effect of 1, which translates to minimum damage of 1 before armor.

---

## 8. Initiative

### Initiative Modifiers (p.15)

| Condition | Modifier |
|-----------|----------|
| Organization/Confidence of Crews (Intelligence or Social + Leadership or Admin) | Apply stat sum |
| Side whose lowest thrust is higher than the other side's lowest thrust | Initiative +1 |
| Effect of the rolls of the Encounter Setup | Apply prior roll effect |

### Turn Order

1. Determine initiative modifiers
2. Roll initiative for each ship/side
3. Ships act in order of **highest to lowest initiative result**
4. After all turns occur, a new round begins
5. During each ship's turn, characters act in this order:
   1. **Captain**
   2. **NavComm**
   3. **Engineer**
   4. **Pilot**
   5. **Gunner**
   6. **Others**

### Grouping NPC Ship Turns

When there are large numbers of ships, the Referee can let ships of the same faction act at the same time, setting all their initiatives to the same value as the **lowest among rolled initiatives** for ships of that faction.

This way, all characters of a certain Function of a side can act at once, and the same die roll might be used for their actions whenever convenient.
