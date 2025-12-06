# Detailed Missing Messages Report

**Total Missing**: 204 messages

---

## MIRROR (1 messages)

**Priority**: HIGH  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:974

**Message**: "You feel a faint tingling transmitted through the ."

**Verb**: RUB

**Object**: MIRROR

**Condition**: `EQUAL? .RARG ,M-LOOK AND EQUAL? ,PRSI ,HANDS`

---

## THIEF (1 messages)

**Priority**: HIGH  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:1813

**Message**: "your possession Doing unto others before...\"

**Object**: THIEF

---

## ROPE (1 messages)

**Priority**: HIGH  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:3056

**Message**: "Your attempt to tie up the  awakens him. The  struggles and you cannot tie him up."

**Verb**: CLIMB-DOWN

**Object**: ROPE

**Condition**: `IN? .RLOC ,ROOMS AND EQUAL? ,PRSO ,ROPE ,ROOMS AND EQUAL? ,ROPE ,PRSI AND FSET? ,PRSO ,ACTORBIT`

---

## V (62 messages)

**Priority**: LOW  
**Estimated Effort**: 3-4 hours

### Messages

#### 1actions.zil:3998

**Message**: "which will be cured after"

**Object**: V

**Condition**: `EQUAL? .WHERE ,THIEF`

---

#### 1actions.zil:4000

**Message**: "which will be cured after"

**Object**: V

**Condition**: `EQUAL? .WHERE ,THIEF`

---

#### 1actions.zil:4001

**Message**: "which will be cured after"

**Object**: V

**Condition**: `EQUAL? .WHERE ,THIEF`

---

#### 1actions.zil:4002

**Message**: "which will be cured after"

**Object**: V

**Condition**: `EQUAL? .WHERE ,THIEF AND EQUAL? .WD 2`

---

#### 1actions.zil:4003

**Message**: "which will be cured after"

**Object**: V

**Condition**: `EQUAL? .WD 2 AND EQUAL? .WD 3`

---

#### 1actions.zil:4004

**Message**: "which will be cured after"

**Object**: V

**Condition**: `EQUAL? .WD 2 AND EQUAL? .WD 3`

---

#### 1actions.zil:4006

**Message**: "which will be cured after"

**Object**: V

**Condition**: `EQUAL? .WD 2 AND EQUAL? .WD 3`

---

#### gverbs.zil:65

**Message**: "Restarting."

**Object**: V

**Condition**: `EQUAL? .WRD ,W?QUIT ,W?Q`

---

#### gverbs.zil:67

**Message**: "Restarting."

**Object**: V

**Condition**: `EQUAL? .WRD ,W?QUIT ,W?Q`

---

#### gverbs.zil:88

**Message**: "Here begins a transcript of interaction with"

**Object**: V

---

#### gverbs.zil:124

**Message**: "Verifying disk..."

**Object**: V

---

#### gverbs.zil:126

**Message**: "The disk is correct."

**Object**: V

---

#### gverbs.zil:128

**Message**: "** Disk Failure **"

**Object**: V

---

#### gverbs.zil:136

**Message**: "Illegal call to #RND."

**Object**: V

**Condition**: `EQUAL? ,PRSO ,INTNUM`

---

#### gverbs.zil:165

**Message**: "He's wide awake, or haven't you noticed..."

**Object**: V

**Condition**: `FSET? ,PRSO ,ACTORBIT`

---

#### gverbs.zil:171

**Message**: "Nobody seems to be awaiting your answer."

**Object**: V

**Condition**: `FSET? ,PRSO ,ACTORBIT`

---

#### gverbs.zil:196

**Message**: "Sorry, my memory is poor. Please give a direction."

**Object**: V

**Condition**: `EQUAL? ,PRSI ,HANDS AND IN? ,PRSI ,WINNER AND FSET? ,PRSI ,WEAPONBIT`

---

#### gverbs.zil:234

**Message**: "If you wish, but heaven only knows why."

**Object**: V

---

#### gverbs.zil:262

**Message**: "holding it at the time. The  catches fire and is consumed."

**Object**: V

**Condition**: `EQUAL? <LOC ,PRSO AND FSET? ,PRSO ,BURNBIT AND IN? ,PRSO ,WINNER AND IN? ,WINNER ,PRSO`

---

#### gverbs.zil:263

**Message**: "holding it at the time. The  catches fire and is consumed."

**Object**: V

**Condition**: `EQUAL? <LOC ,PRSO AND FSET? ,PRSO ,BURNBIT AND IN? ,PRSO ,WINNER AND IN? ,WINNER ,PRSO`

---

#### gverbs.zil:266

**Message**: "holding it at the time. The  catches fire and is consumed."

**Object**: V

**Condition**: `EQUAL? <LOC ,PRSO AND FSET? ,PRSO ,BURNBIT AND IN? ,PRSO ,WINNER AND IN? ,WINNER ,PRSO AND IN? ,WINNER ,PRSO`

---

#### gverbs.zil:267

**Message**: "holding it at the time. The  catches fire and is consumed."

**Object**: V

**Condition**: `EQUAL? <LOC ,PRSO AND FSET? ,PRSO ,BURNBIT AND IN? ,PRSO ,WINNER AND IN? ,WINNER ,PRSO AND IN? ,WINNER ,PRSO`

---

#### gverbs.zil:271

**Message**: "The  catches fire and is consumed."

**Object**: V

**Condition**: `FSET? ,PRSO ,BURNBIT AND IN? ,PRSO ,WINNER AND IN? ,WINNER ,PRSO AND IN? ,WINNER ,PRSO`

---

#### gverbs.zil:394

**Message**: "Your skillful  into innumerable slivers which blow away."

**Object**: V

**Condition**: `FSET? ,PRSO ,ACTORBIT AND FSET? ,PRSO ,BURNBIT AND FSET? ,PRSI ,WEAPONBIT AND IN? ,WINNER ,PRSO`

---

#### gverbs.zil:430

**Message**: "You realize that getting out here would be fatal."

**Object**: V

**Condition**: `EQUAL? ,PRSO ,ROOMS AND FSET? <LOC ,WINNER AND EQUAL? <LOC ,WINNER AND FSET? ,HERE ,RLANDBIT`

---

#### gverbs.zil:443

**Message**: "The  seems stronger now."

**Object**: V

**Condition**: `IN? ,PRSO ,HERE AND EQUAL? ,SPELL-USED ,W?FEEBLE ,W?FUMBLE ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE ,W?FALL ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE ,W?FENCE ,W?FANTASIZE AND FSET? ,PRSO ,ACTORBIT AND EQUAL? ,SPELL-USED ,W?FEEBLE`

---

#### gverbs.zil:446

**Message**: "The  no longer appears clumsy."

**Object**: V

**Condition**: `IN? ,PRSO ,HERE AND EQUAL? ,SPELL-USED ,W?FEEBLE ,W?FUMBLE ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE ,W?FALL ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE ,W?FENCE ,W?FANTASIZE AND FSET? ,PRSO ,ACTORBIT AND EQUAL? ,SPELL-USED ,W?FEEBLE AND EQUAL? ,SPELL-USED ,W?FUMBLE`

---

#### gverbs.zil:449

**Message**: "The  no longer appears afraid."

**Object**: V

**Condition**: `IN? ,PRSO ,HERE AND EQUAL? ,SPELL-USED ,W?FEEBLE ,W?FUMBLE ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE ,W?FALL ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE ,W?FENCE ,W?FANTASIZE AND FSET? ,PRSO ,ACTORBIT AND EQUAL? ,SPELL-USED ,W?FEEBLE AND EQUAL? ,SPELL-USED ,W?FUMBLE AND EQUAL? ,SPELL-USED ,W?FEAR`

---

#### gverbs.zil:455

**Message**: "The  stops swaying."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FIERCE ,W?FENCE ,W?FANTASIZE AND FSET? ,PRSO ,ACTORBIT AND EQUAL? ,SPELL-USED ,W?FEEBLE AND EQUAL? ,SPELL-USED ,W?FUMBLE AND EQUAL? ,SPELL-USED ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE AND EQUAL? ,SPELL-USED ,W?FERMENT`

---

#### gverbs.zil:458

**Message**: "The  appears more peaceful."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FUMBLE AND EQUAL? ,SPELL-USED ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE AND EQUAL? ,SPELL-USED ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE`

---

#### gverbs.zil:461

**Message**: "The  sinks to the ground."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE AND EQUAL? ,SPELL-USED ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE AND EQUAL? ,SPELL-USED ,W?FLOAT`

---

#### gverbs.zil:464

**Message**: "The sweet smell has dispersed."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FREEZE AND EQUAL? ,SPELL-USED ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE AND EQUAL? ,SPELL-USED ,W?FLOAT AND EQUAL? ,SPELL-USED ,W?FUDGE`

---

#### gverbs.zil:489

**Message**: "Thank you very much. It really hit the spot."

**Verb**: DRINK

**Object**: V

**Condition**: `EQUAL? ,PRSO <LOC ,WINNER AND FSET? ,PRSO ,FOODBIT AND IN? ,PRSO ,WINNER AND IN? <LOC ,PRSO`

---

#### gverbs.zil:491

**Message**: "Thank you very much. It really hit the spot."

**Verb**: DRINK

**Object**: V

**Condition**: `FSET? ,PRSO ,FOODBIT AND IN? ,PRSO ,WINNER AND IN? <LOC ,PRSO`

---

#### gverbs.zil:545

**Message**: "echo echo ..."

**Object**: V

---

#### gverbs.zil:546

**Message**: "echo echo ..."

**Object**: V

---

#### gverbs.zil:548

**Message**: "echo echo ..."

**Object**: V

---

#### gverbs.zil:564

**Message**: "The wand stops glowing, but there is no other obvious effect."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FEEBLE ,W?FUMBLE ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE ,W?FALL ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE ,W?FENCE ,W?FANTASIZE AND FSET? ,PRSO ,ACTORBIT`

---

#### gverbs.zil:567

**Message**: "That might have done something, but it's hard to tell with a ."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FEEBLE ,W?FUMBLE ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE ,W?FALL ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE ,W?FENCE ,W?FANTASIZE AND FSET? ,PRSO ,ACTORBIT`

---

#### gverbs.zil:572

**Message**: "A strong odor of chocolate permeates the room."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FEEBLE ,W?FUMBLE ,W?FEAR AND EQUAL? ,SPELL-USED ,W?FREEZE ,W?FALL ,W?FERMENT AND EQUAL? ,SPELL-USED ,W?FIERCE ,W?FENCE ,W?FANTASIZE AND FSET? ,PRSO ,ACTORBIT AND EQUAL? ,SPELL-USED ,W?FIREPROOF AND EQUAL? ,SPELL-USED ,W?FUDGE`

---

#### gverbs.zil:585

**Message**: "Filched!"

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FUDGE AND EQUAL? ,SPELL-USED ,W?FLUORESCE AND EQUAL? ,SPELL-USED ,W?FILCH AND FSET? ,PRSO ,TAKEBIT`

---

#### gverbs.zil:587

**Message**: "You can't filch the"

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FLUORESCE AND EQUAL? ,SPELL-USED ,W?FILCH AND FSET? ,PRSO ,TAKEBIT`

---

#### gverbs.zil:593

**Message**: "The  floats serenely in midair."

**Object**: V

**Condition**: `EQUAL? ,SPELL-USED ,W?FILCH AND FSET? ,PRSO ,TAKEBIT AND EQUAL? ,SPELL-USED ,W?FLOAT AND FSET? ,PRSO ,TAKEBIT AND EQUAL? ,SPELL-VICTIM ,COLLAR AND IN? ,COLLAR ,CERBERUS`

---

#### gverbs.zil:683

**Message**: "You're around here somewhere..."

**Object**: V

**Condition**: `IN? ,WATER <LOC ,WINNER AND EQUAL? ,PRSO ,HANDS ,LUNGS AND EQUAL? ,PRSO ,ME`

---

#### gverbs.zil:699

**Message**: "Beats me."

**Object**: V

**Condition**: `EQUAL? .L ,GLOBAL-OBJECTS AND IN? ,PRSO ,WINNER AND IN? ,PRSO ,HERE AND EQUAL? ,PRSO ,PSEUDO-OBJECT AND FSET? .L ,ACTORBIT AND FSET? .L ,SURFACEBIT AND FSET? .L ,CONTBIT`

---

#### gverbs.zil:743

**Message**: "The wand glows very brightly for a moment."

**Object**: V

---

#### gverbs.zil:748

**Message**: "The incantation echoes back faintly, but nothing else happens."

**Object**: V

---

#### gverbs.zil:751

**Message**: "The incantation echoes back faintly, but nothing else happens."

**Object**: V

---

#### gverbs.zil:808

**Message**: "That's pretty weird."

**Object**: V

**Condition**: `FSET? ,PRSO ,BURNBIT AND FSET? ,PRSO ,VEHBIT`

---

#### gverbs.zil:828

**Message**: "This was not a very safe place to try jumping."

**Object**: V

**Condition**: `IN? ,PRSO ,HERE AND FSET? ,PRSO ,ACTORBIT AND EQUAL? .S 2 AND EQUAL? .S 4`

---

#### gverbs.zil:863

**Message**: "There is nothing behind the"

**Object**: V

---

#### gverbs.zil:1117

**Message**: "That hiding place is too obvious."

**Object**: V

**Condition**: `FSET? ,PRSO ,TRYTAKEBIT`

---

#### gverbs.zil:1189

**Message**: "You must address the"

**Object**: V

**Condition**: `EQUAL? <GET ,P-LEXV ,P-CONT AND EQUAL? <GET ,P-LEXV <+ ,P-CONT 2 AND EQUAL? ,HERE ,MSTAIRS`

---

#### gverbs.zil:1317

**Message**: "Since you aren't versed in hand-to-hand combat, you'd better attack the  with a weapon."

**Object**: V

**Condition**: `FSET? <LOC ,WINNER AND FSET? ,PRSO ,ACTORBIT`

---

#### gverbs.zil:1339

**Message**: "Between the rocks and waves, you wouldn't last a minute!"

**Object**: V

**Condition**: `EQUAL? ,PRSO ,WATER ,GLOBAL-WATER AND EQUAL? ,HERE ,ON-LAKE ,IN-LAKE AND EQUAL? ,HERE ,FLATHEAD-OCEAN`

---

#### gverbs.zil:1385

**Message**: "You are now wearing the"

**Object**: V

**Condition**: `EQUAL? ,PRSI <LOC ,PRSO AND EQUAL? ,PRSO <LOC ,WINNER AND EQUAL? <ITAKE AND FSET? ,PRSO ,WEARBIT`

---

#### gverbs.zil:1434

**Message**: "You can't go more than part way through the curtain."

**Object**: V

**Condition**: `EQUAL? ,HERE ,DEPOSITORY AND EQUAL? ,PRSO ,SNWL AND EQUAL? ,HERE ,SCOL-ACTIVE AND EQUAL? ,PRSO ,CURTAIN`

---

#### gverbs.zil:1438

**Message**: "You hit your head against the  as you attempt this feat."

**Object**: V

**Condition**: `EQUAL? ,HERE ,SCOL-ACTIVE AND EQUAL? ,PRSO ,CURTAIN`

---

#### gverbs.zil:1441

**Message**: "That would involve quite a contortion!"

**Object**: V

**Condition**: `EQUAL? ,PRSO ,CURTAIN AND IN? ,PRSO ,WINNER`

---

#### gverbs.zil:1584

**Message**: "Use compass directions for movement."

**Object**: V

**Condition**: `EQUAL? ,HERE ,DARK-1 ,DARK-2`

---

#### gverbs.zil:1590

**Message**: "It's here!"

**Object**: V

**Condition**: `IN? ,PRSO ,HERE`

---

#### gverbs.zil:1592

**Message**: "You should supply a direction!"

**Object**: V

**Condition**: `IN? ,PRSO ,HERE`

---

## other (25 messages)

**Priority**: LOW  
**Estimated Effort**: 3-4 hours

### Messages

#### 1actions.zil:743

**Message**: "D ,PRSO"

**Condition**: `EQUAL? ,PRSO ,KNIFE ,SWORD ,AXE AND EQUAL? ,PRSO ,KNIFE ,SWORD ,AXE`

---

#### 1actions.zil:1718

**Message**: "That's only your opinion."

**Condition**: `EQUAL? .WRD ,W?SAY AND EQUAL? .WRD ,W?SAVE AND EQUAL? .WRD ,W?RESTORE AND EQUAL? .WRD ,W?Q ,W?QUIT AND EQUAL? .WRD ,W?W ,W?WEST AND EQUAL? .WRD ,W?E ,W?EAST AND EQUAL? .WRD ,W?U ,W?UP AND EQUAL? .WRD ,W?BUG`

---

#### 1actions.zil:1722

**Message**: "The acoustics of the room change subtly."

**Condition**: `EQUAL? .WRD ,W?RESTORE AND EQUAL? .WRD ,W?Q ,W?QUIT AND EQUAL? .WRD ,W?W ,W?WEST AND EQUAL? .WRD ,W?E ,W?EAST AND EQUAL? .WRD ,W?U ,W?UP AND EQUAL? .WRD ,W?BUG AND EQUAL? .WRD ,W?ECHO`

---

#### 1actions.zil:1817

**Message**: "your possession Doing unto others before...\"

**Condition**: `EQUAL? .ROBBED? ,HERE`

---

#### 1actions.zil:1819

**Message**: "your possession Doing unto others before...\"

**Condition**: `EQUAL? .ROBBED? ,HERE`

---

#### 1actions.zil:1820

**Message**: "Doing unto others before...\"

**Condition**: `EQUAL? .ROBBED? ,HERE`

---

#### 1actions.zil:1826

**Message**: "robbed you blind first. appropriated the valuables in the room."

**Condition**: `EQUAL? .ROBBED? ,HERE`

---

#### 1actions.zil:1830

**Message**: "robbed you blind first. appropriated the valuables in the room."

**Condition**: `EQUAL? .ROBBED? ,HERE AND EQUAL? .ROBBED? ,PLAYER`

---

#### 1actions.zil:1833

**Message**: "appropriated the valuables in the room."

**Condition**: `EQUAL? .ROBBED? ,PLAYER`

---

#### 1actions.zil:1838

**Message**: "The thief, finding nothing of value, left disgusted."

**Condition**: `EQUAL? .ROBBED? ,PLAYER`

---

#### 1actions.zil:1856

**Message**: "robbed you blind first. appropriated the valuables in the room."

---

#### 1actions.zil:1860

**Message**: "robbed you blind first. appropriated the valuables in the room."

**Condition**: `EQUAL? .ROBBED? ,PLAYER`

---

#### 1actions.zil:1863

**Message**: "appropriated the valuables in the room."

**Condition**: `EQUAL? .ROBBED? ,PLAYER`

---

#### 1actions.zil:1868

**Message**: "The thief, finding nothing of value, left disgusted."

**Condition**: `EQUAL? .ROBBED? ,PLAYER`

---

#### 1actions.zil:2006

**Message**: "D ,PRSO"

**Condition**: `EQUAL? ,PRSO ,STILETTO`

---

#### 1actions.zil:3169

**Message**: "Your prayers are not heard."

**Condition**: `IN? ,TROLL ,TROLL-ROOM`

---

#### gmain.zil:144

**Message**: ": end multiple exceptions"

**Condition**: `EQUAL? <GET <GET ,P-ITBL ,P-NC1 AND IN? .O .I AND EQUAL? ,P-GETFLAGS ,P-ALL AND EQUAL? <LOC .O AND EQUAL? <LOC .O AND FSET? <LOC .O AND FSET? .O ,TAKEBIT AND FSET? .O ,TRYTAKEBIT AND EQUAL? .OBJ1 ,IT`

---

#### gverbs.zil:602

**Message**: "The wand stops glowing, but there is no other apparent effect."

**Condition**: `EQUAL? ,SPELL-USED ,W?FLOAT AND FSET? ,PRSO ,TAKEBIT AND EQUAL? ,SPELL-VICTIM ,COLLAR AND IN? ,COLLAR ,CERBERUS AND EQUAL? ,SPELL-USED ,W?FRY AND FSET? ,PRSO ,TAKEBIT`

---

#### gverbs.zil:1954

**Message**: "When you touch the  it immediately disappears!"

**Condition**: `EQUAL? ,SPELL? ,S-FILCH`

---

#### gverbs.zil:2099

**Message**: "There are sinister gurgling noises in the darkness all around you!"

**Condition**: `FSET? .WLOC ,VEHBIT`

---

#### gparser.zil:172

**Message**: "Warning: only the first word after OOPS is used."

**Condition**: `EQUAL? <GET ,P-LEXV <+ .PTR ,P-LEXELEN AND EQUAL? <GET ,P-LEXV <+ .PTR ,P-LEXELEN`

---

#### gparser.zil:194

**Message**: "Beg pardon?"

**Condition**: `EQUAL? .WRD ,W?AGAIN ,W?G AND EQUAL? <GET ,P-LEXV .PTR`

---

#### gparser.zil:197

**Message**: "It's difficult to repeat fragments."

**Condition**: `EQUAL? .WRD ,W?AGAIN ,W?G AND EQUAL? <GET ,P-LEXV .PTR`

---

#### gparser.zil:200

**Message**: "That would just repeat a mistake."

**Condition**: `EQUAL? .WRD ,W?AGAIN ,W?G AND EQUAL? <GET ,P-LEXV .PTR`

---

#### gparser.zil:1113

**Message**: "There seems to be a noun missing in that sentence!"

**Condition**: `EQUAL? ,WINNER ,PLAYER AND EQUAL? .TBL ,P-PRSO`

---

## DEAD (9 messages)

**Priority**: LOW  
**Estimated Effort**: 2-3 hours

### Messages

#### 1actions.zil:3122

**Message**: "All such attacks are vain in your condition."

**Verb**: WALK

**Object**: DEAD

**Condition**: `IN? ,LUNCH ,PRSO AND EQUAL? ,HERE ,TIMBER-ROOM AND EQUAL? ,PRSO ,P?WEST`

---

#### 1actions.zil:3126

**Message**: "Even such an action is beyond your capabilities."

**Verb**: BRIEF

**Object**: DEAD

**Condition**: `EQUAL? ,HERE ,TIMBER-ROOM AND EQUAL? ,PRSO ,P?WEST`

---

#### 1actions.zil:3129

**Message**: "Might as well. You've got an eternity."

**Verb**: ATTACK

**Object**: DEAD

**Condition**: `EQUAL? ,HERE ,TIMBER-ROOM AND EQUAL? ,PRSO ,P?WEST`

---

#### 1actions.zil:3133

**Message**: "You're dead! How can you think of your score?"

**Verb**: OPEN

**Object**: DEAD

---

#### 1actions.zil:3137

**Message**: "You have no possessions."

**Verb**: WAIT

**Object**: DEAD

---

#### 1actions.zil:3141

**Message**: "and objects appear indistinct. Although there is no light, the room seems dimly illuminated."

**Verb**: SCORE

**Object**: DEAD

---

#### 1actions.zil:3143

**Message**: "and objects appear indistinct. Although there is no light, the room seems dimly illuminated."

**Verb**: TAKE

**Object**: DEAD

---

#### 1actions.zil:3145

**Message**: "and objects appear indistinct. Although there is no light, the room seems dimly illuminated."

**Verb**: DROP

**Object**: DEAD

---

#### 1actions.zil:3148

**Message**: "Although there is no light, the room seems dimly illuminated."

**Verb**: DIAGNOSE

**Object**: DEAD

**Condition**: `FSET? ,HERE ,ONBIT`

---

## CRETIN (9 messages)

**Priority**: LOW  
**Estimated Effort**: 2-3 hours

### Messages

#### gglobals.zil:225

**Message**: "Talking to yourself is said to be a sign of impending mental collapse."

**Verb**: TELL

**Object**: CRETIN

---

#### gglobals.zil:236

**Message**: "Auto-cannibalism is not the answer."

**Verb**: GIVE

**Object**: CRETIN

**Condition**: `EQUAL? ,PRSI ,ME`

---

#### gglobals.zil:241

**Message**: "Suicide is not the answer."

**Verb**: MAKE

**Object**: CRETIN

**Condition**: `EQUAL? ,PRSI ,ME AND FSET? ,PRSI ,WEAPONBIT`

---

#### gglobals.zil:244

**Message**: "Why don't you just walk like normal people?"

**Verb**: EAT

**Object**: CRETIN

**Condition**: `FSET? ,PRSI ,WEAPONBIT`

---

#### gglobals.zil:247

**Message**: "How romantic!"

**Verb**: ATTACK

**Object**: CRETIN

**Condition**: `FSET? ,PRSI ,WEAPONBIT`

---

#### gglobals.zil:251

**Message**: "Your image in the mirror looks tired."

**Verb**: THROW

**Object**: CRETIN

**Condition**: `FSET? ,PRSI ,WEAPONBIT AND EQUAL? ,HERE <LOC ,MIRROR-1`

---

#### gglobals.zil:255

**Message**: "A good trick, as you are currently invisible."

**Verb**: TAKE

**Object**: CRETIN

**Condition**: `EQUAL? ,HERE <LOC ,MIRROR-1`

---

#### gglobals.zil:261

**Message**: "What you can see looks pretty much as usual, sorry to say."

**Object**: CRETIN

**Condition**: `EQUAL? ,HERE <LOC ,MIRROR-1`

---

#### gglobals.zil:264

**Message**: "That's difficult unless your eyes are prehensile."

**Object**: CRETIN

**Condition**: `EQUAL? ,HERE <LOC ,MIRROR-1`

---

## DESCRIBE (8 messages)

**Priority**: LOW  
**Estimated Effort**: 2-3 hours

### Messages

#### gverbs.zil:1704

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,TOUCHBIT`

---

#### gverbs.zil:1706

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,TOUCHBIT AND FSET? .OBJ ,ONBIT`

---

#### gverbs.zil:1707

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,TOUCHBIT AND FSET? .OBJ ,ONBIT`

---

#### gverbs.zil:1709

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,TOUCHBIT AND FSET? .OBJ ,ONBIT`

---

#### gverbs.zil:1710

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,TOUCHBIT AND FSET? .OBJ ,ONBIT`

---

#### gverbs.zil:1712

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,TOUCHBIT AND FSET? .OBJ ,ONBIT AND FSET? .OBJ ,ONBIT`

---

#### gverbs.zil:1715

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,ONBIT AND FSET? .OBJ ,ONBIT AND FSET? .OBJ ,WEARBIT AND IN? .OBJ ,WINNER`

---

#### gverbs.zil:1719

**Message**: "(floating in midair)"

**Object**: DESCRIBE

**Condition**: `FSET? .OBJ ,ONBIT AND FSET? .OBJ ,ONBIT AND FSET? .OBJ ,WEARBIT AND IN? .OBJ ,WINNER AND EQUAL? .OBJ ,SPELL-VICTIM AND EQUAL? ,SPELL-USED ,W?FLOAT`

---

## VERB-TAKE (5 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:753

**Message**: "The troll spits in your face, grunting \"

**Verb**: TAKE

**Condition**: `EQUAL? ,PRSO ,KNIFE ,SWORD ,AXE`

---

#### 1actions.zil:757

**Message**: "The troll laughs at your puny gesture."

**Verb**: TAKE

---

#### 1actions.zil:2010

**Message**: "The thief places the"

**Verb**: TAKE

**Condition**: `EQUAL? ,PRSO ,STILETTO`

---

#### 1actions.zil:2014

**Message**: "Once you got him, what would you do with him?"

**Verb**: TAKE

**Condition**: `EQUAL? ,PRSO ,STILETTO`

---

#### 1actions.zil:2023

**Message**: "The thief says nothing, as you have not been formally introduced."

**Verb**: TAKE

---

## MATCH (4 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2297

**Message**: "The match is burning. The matchbook isn't very interesting, except for what's written on it."

**Verb**: COUNT

**Object**: MATCH

**Condition**: `FSET? ,MATCH ,FLAMEBIT`

---

#### 1actions.zil:2298

**Message**: "The match is burning. The matchbook isn't very interesting, except for what's written on it."

**Verb**: COUNT

**Object**: MATCH

**Condition**: `FSET? ,MATCH ,FLAMEBIT`

---

#### 1actions.zil:2302

**Message**: "The match is burning. The matchbook isn't very interesting, except for what's written on it."

**Verb**: COUNT

**Object**: MATCH

**Condition**: `FSET? ,MATCH ,ONBIT`

---

#### 1actions.zil:2304

**Message**: "The matchbook isn't very interesting, except for what's written on it."

**Verb**: EXAMINE

**Object**: MATCH

**Condition**: `FSET? ,MATCH ,ONBIT`

---

## SAILOR (4 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### gglobals.zil:140

**Message**: "The seaman looks up and maneuvers the boat toward shore. He cries out \"

**Verb**: HELLO

**Object**: SAILOR

**Condition**: `FSET? ,VIKING-SHIP ,INVISIBLE AND FSET? ,VIKING-SHIP ,INVISIBLE`

---

#### gglobals.zil:150

**Message**: "Nothing happens anymore."

**Object**: SAILOR

**Condition**: `FSET? ,VIKING-SHIP ,INVISIBLE`

---

#### gglobals.zil:152

**Message**: "Nothing happens yet."

**Object**: SAILOR

**Condition**: `FSET? ,VIKING-SHIP ,INVISIBLE`

---

#### gglobals.zil:159

**Message**: "I think that phrase is getting a bit worn out."

**Object**: SAILOR

---

## PRE (4 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### gverbs.zil:220

**Message**: "You have a theory on how to board a , perhaps?"

**Object**: PRE

**Condition**: `FSET? ,PRSO ,VEHBIT AND IN? ,PRSO ,HERE AND FSET? .AV ,VEHBIT AND EQUAL? ,PRSO ,WATER ,GLOBAL-WATER`

---

#### gverbs.zil:912

**Message**: "You aren't an accomplished enough juggler."

**Object**: PRE

---

#### gverbs.zil:1356

**Message**: "You are already wearing it."

**Object**: PRE

**Condition**: `IN? ,PRSO ,WINNER AND FSET? ,PRSO ,WEARBIT`

---

#### gverbs.zil:1361

**Message**: "You can't reach something that's inside a closed container."

**Object**: PRE

**Condition**: `IN? ,PRSO ,WINNER AND FSET? ,PRSO ,WEARBIT AND FSET? <LOC ,PRSO AND FSET? <LOC ,PRSO`

---

## BUTTON (3 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1300

**Message**: "They're greek to you."

**Verb**: READ

**Object**: BUTTON

---

#### 1actions.zil:1316

**Message**: "shut off."

**Object**: BUTTON

**Condition**: `EQUAL? ,PRSO ,BLUE-BUTTON AND EQUAL? ,PRSO ,RED-BUTTON`

---

#### 1actions.zil:1319

**Message**: "shut off."

**Object**: BUTTON

**Condition**: `EQUAL? ,PRSO ,RED-BUTTON AND FSET? ,HERE ,ONBIT`

---

## RIVER (3 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2676

**Message**: "You should get in the boat then launch it."

**Verb**: PUT

**Object**: RIVER

**Condition**: `EQUAL? ,PRSI ,RIVER AND EQUAL? ,PRSO ,ME AND EQUAL? ,PRSO ,INFLATED-BOAT`

---

#### 1actions.zil:2680

**Message**: "The  floats for a moment, then sinks."

**Verb**: PUT

**Object**: RIVER

**Condition**: `EQUAL? ,PRSI ,RIVER AND EQUAL? ,PRSO ,ME AND EQUAL? ,PRSO ,INFLATED-BOAT AND FSET? ,PRSO ,BURNBIT`

---

#### 1actions.zil:2684

**Message**: "The  splashes into the water and is gone forever."

**Verb**: LEAP

**Object**: RIVER

**Condition**: `EQUAL? ,PRSI ,RIVER AND EQUAL? ,PRSO ,ME AND EQUAL? ,PRSO ,INFLATED-BOAT AND FSET? ,PRSO ,BURNBIT`

---

## IBOAT (3 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2829

**Message**: "A tan label is lying inside the boat."

**Verb**: INFLATE

**Object**: IBOAT

**Condition**: `IN? ,INFLATABLE-BOAT ,HERE AND EQUAL? ,PRSI ,PUMP AND FSET? ,BOAT-LABEL ,TOUCHBIT`

---

#### 1actions.zil:2836

**Message**: "You don't have enough lung power to inflate it."

**Object**: IBOAT

**Condition**: `IN? ,INFLATABLE-BOAT ,HERE AND EQUAL? ,PRSI ,PUMP AND FSET? ,BOAT-LABEL ,TOUCHBIT AND EQUAL? ,PRSI ,LUNGS`

---

#### 1actions.zil:2839

**Message**: "With a ? Surely you jest!"

**Object**: IBOAT

**Condition**: `EQUAL? ,PRSI ,PUMP AND FSET? ,BOAT-LABEL ,TOUCHBIT AND EQUAL? ,PRSI ,LUNGS`

---

## EGG (3 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2922

**Message**: "The egg is already open."

**Verb**: LEAP

**Object**: EGG

**Condition**: `EQUAL? ,PRSO ,WINNER ,TREE AND EQUAL? .RARG ,M-ENTER AND EQUAL? ,PRSO ,EGG AND FSET? ,PRSO ,OPENBIT`

---

#### 1actions.zil:2924

**Message**: "You have neither the tools nor the expertise."

**Verb**: LEAP

**Object**: EGG

**Condition**: `EQUAL? ,PRSO ,WINNER ,TREE AND EQUAL? .RARG ,M-ENTER AND EQUAL? ,PRSO ,EGG AND FSET? ,PRSO ,OPENBIT`

---

#### 1actions.zil:2927

**Message**: "I doubt you could do that without damaging it."

**Verb**: OPEN

**Object**: EGG

**Condition**: `EQUAL? .RARG ,M-ENTER AND EQUAL? ,PRSO ,EGG AND FSET? ,PRSO ,OPENBIT AND EQUAL? ,PRSI ,HANDS`

---

## CHASM (3 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:3194

**Message**: "You look before leaping, and realize that you would never survive."

**Verb**: SWIM

**Object**: CHASM

**Condition**: `EQUAL? ,PRSO ,ME`

---

#### 1actions.zil:3197

**Message**: "It's too far to jump, and there's no bridge."

**Verb**: CROSS

**Object**: CHASM

**Condition**: `EQUAL? ,PRSO ,ME`

---

#### 1actions.zil:3199

**Message**: "The  drops out of sight into the chasm."

**Verb**: LEAP

**Object**: CHASM

**Condition**: `EQUAL? ,PRSO ,ME AND EQUAL? ,PRSI ,PSEUDO-OBJECT`

---

## STONE (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:410

**Message**: "ZORK II: The Wizard of Frobozz\ ZORK III: The Dungeon Master.\"

**Verb**: CLIMB-UP

**Object**: STONE

**Condition**: `EQUAL? ,PRSO ,STAIRS AND EQUAL? ,PRSO ,STAIRS AND EQUAL? .RARG ,M-BEG AND EQUAL? ,PRSO ,P?WEST ,P?IN AND EQUAL? ,PRSO ,BARROW`

---

#### 1actions.zil:420

**Message**: "ZORK II: The Wizard of Frobozz\ ZORK III: The Dungeon Master.\"

**Object**: STONE

**Condition**: `EQUAL? ,PRSO ,P?WEST ,P?IN AND EQUAL? ,PRSO ,BARROW AND EQUAL? <BAND <GETB 0 1`

---

## LEAF (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:788

**Message**: "There are 69,105 leaves here."

**Verb**: COUNT

**Object**: LEAF

**Condition**: `FSET? ,GRATE ,OPENBIT`

---

#### 1actions.zil:799

**Message**: "You rustle the leaves around, making quite a mess."

**Verb**: BURN

**Object**: LEAF

**Condition**: `IN? ,PRSO ,HERE`

---

## LLD (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1077

**Message**: "You must perform the ceremony."

**Verb**: EXORCISE

**Object**: LLD

**Condition**: `EQUAL? .RARG ,M-BEG AND IN? ,BELL ,WINNER AND IN? ,BOOK ,WINNER AND IN? ,CANDLES ,WINNER`

---

#### 1actions.zil:1106

**Message**: "Begone, fiends!\"

**Verb**: READ

**Object**: LLD

**Condition**: `IN? ,CANDLES ,WINNER AND EQUAL? ,PRSO ,BOOK`

---

## TOOL (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1334

**Message**: "The chests are all empty."

**Verb**: EXAMINE

**Object**: TOOL

**Condition**: `EQUAL? ,PRSO ,BROWN-BUTTON AND EQUAL? ,PRSO ,YELLOW-BUTTON`

---

#### 1actions.zil:1341

**Message**: "The chests are already open."

**Verb**: EXAMINE

**Object**: TOOL

**Condition**: `EQUAL? ,PRSO ,YELLOW-BUTTON`

---

## TUBE (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1394

**Message**: "The viscous material oozes into your hand."

**Verb**: PUT

**Object**: TUBE

**Condition**: `EQUAL? ,PRSI ,PUTTY AND EQUAL? ,PRSO ,PUTTY AND EQUAL? ,PRSI ,TUBE AND FSET? ,PRSO ,OPENBIT AND IN? ,PUTTY ,PRSO`

---

#### 1actions.zil:1396

**Message**: "The tube is apparently empty."

**Verb**: PUT

**Object**: TUBE

**Condition**: `EQUAL? ,PRSI ,PUTTY AND EQUAL? ,PRSO ,PUTTY AND EQUAL? ,PRSI ,TUBE AND FSET? ,PRSO ,OPENBIT AND IN? ,PUTTY ,PRSO AND FSET? ,PRSO ,OPENBIT`

---

## LOUD (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1662

**Message**: "The room is eerie in its quietness."

**Object**: LOUD

**Condition**: `EQUAL? .RARG ,M-LOOK`

---

#### 1actions.zil:1668

**Message**: "The room is eerie in its quietness."

**Object**: LOUD

**Condition**: `EQUAL? .RARG ,M-LOOK`

---

## VERB-INFLATE (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2802

**Message**: "Inflating it further would probably burst it."

**Verb**: INFLATE

**Condition**: `IN? ,SCEPTRE ,WINNER AND IN? ,KNIFE ,WINNER AND IN? ,SWORD ,WINNER AND IN? ,RUSTY-KNIFE ,WINNER AND IN? ,AXE ,WINNER AND IN? ,STILETTO ,WINNER`

---

#### 1actions.zil:2805

**Message**: "You can't deflate the boat while you're in it."

**Verb**: INFLATE

**Condition**: `IN? ,SWORD ,WINNER AND IN? ,RUSTY-KNIFE ,WINNER AND IN? ,AXE ,WINNER AND IN? ,STILETTO ,WINNER AND EQUAL? <LOC ,WINNER`

---

## CANARY (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2986

**Message**: "The canary chirps blithely, if somewhat tinnily, for a short time."

**Object**: CANARY

**Condition**: `EQUAL? ,PRSO ,CANARY AND EQUAL? ,HERE ,UP-A-TREE`

---

#### 1actions.zil:2989

**Message**: "There is an unpleasant grinding noise from inside the canary."

**Object**: CANARY

**Condition**: `EQUAL? ,HERE ,UP-A-TREE`

---

## STUPID (2 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:4145

**Message**: "The  are safely inside; there's no need to do that."

**Verb**: OPEN

**Object**: STUPID

---

#### 1actions.zil:4151

**Message**: "Don't be silly. It wouldn't be a  anymore."

**Verb**: OPEN

**Object**: STUPID

**Condition**: `EQUAL? ,PRSI .OBJ`

---

## FLY (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:319

**Message**: "The bat grabs you by the scruff of your neck and lifts you away...."

**Verb**: TELL

**Object**: FLY

**Condition**: `EQUAL? ,PRSO ,RAISED-BASKET ,LOWERED-BASKET AND EQUAL? <LOC ,GARLIC`

---

## FWEEP (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:329

**Message**: "Fweep!"

**Condition**: `EQUAL? ,HERE ,ENTRANCE-TO-HADES`

---

## RUG (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:616

**Message**: "I suppose you think it's a magic carpet?"

**Verb**: CLIMB-ON

**Object**: RUG

**Condition**: `FSET? ,TRAP-DOOR ,OPENBIT AND FSET? ,TRAP-DOOR ,OPENBIT`

---

## TORCH (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:951

**Message**: "You nearly burn your hand trying to extinguish the flame."

**Verb**: EXAMINE

**Object**: TORCH

**Condition**: `EQUAL? ,PRSI ,TORCH AND FSET? ,PRSO ,ONBIT`

---

## I (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1276

**Message**: "The roar of rushing water is quieter now."

**Object**: I

**Condition**: `EQUAL? ,HERE ,RESERVOIR AND FSET? <LOC ,WINNER AND EQUAL? ,HERE ,DEEP-CANYON`

---

## ROB (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1925

**Message**: "You hear, off in the distance, someone saying \ D .X"

**Object**: ROB

**Condition**: `FSET? .X ,TAKEBIT AND FSET? .X ,INVISIBLE`

---

## ROBBER (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:1997

**Message**: "Your proposed victim suddenly recovers consciousness."

**Object**: ROBBER

**Condition**: `EQUAL? ,PRSO ,THIEF AND EQUAL? ,PRSI ,THIEF`

---

## LARGE-BAG (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2107

**Message**: "Getting close enough would be a good trick."

**Verb**: PUT

**Object**: LARGE-BAG

**Condition**: `EQUAL? <GETP ,THIEF ,P?LDESC AND EQUAL? ,PRSI ,LARGE-BAG`

---

## CHALICE (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2131

**Message**: "You'd be stabbed in the back first."

**Verb**: TAKE

**Object**: CHALICE

**Condition**: `IN? ,PRSO ,TREASURE-ROOM AND IN? ,THIEF ,TREASURE-ROOM AND FSET? ,THIEF ,FIGHTBIT AND FSET? ,THIEF ,INVISIBLE AND EQUAL? <GETP ,THIEF ,P?LDESC`

---

## BODY (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:2180

**Message**: "A force keeps you from taking the bodies."

**Verb**: LOOK-BEHIND

**Object**: BODY

---

## LANTERN (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:2232

**Message**: "The lamp has smashed into the floor, and the light has gone out."

**Verb**: THROW

---

## MAILBOX (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2261

**Message**: "It is securely anchored."

**Verb**: TAKE

**Object**: MAILBOX

**Condition**: `FSET? ,LAMP ,RMUNGBIT AND FSET? ,LAMP ,ONBIT AND EQUAL? ,PRSO ,MAILBOX`

---

## VERB-PUT (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2398

**Message**: "That wouldn't be smart."

**Verb**: PUT

**Condition**: `FSET? ,CANDLES ,ONBIT AND FSET? ,PRSI ,BURNBIT`

---

## CAVE2 (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2426

**Message**: "It is now completely dark."

**Object**: CAVE2

**Condition**: `EQUAL? .RARG ,M-END AND IN? ,CANDLES ,WINNER AND FSET? ,CANDLES ,ONBIT`

---

## BOOM (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2459

**Message**: "How sad for an aspiring adventurer to light a"

**Verb**: LAMP-ON

**Object**: BOOM

**Condition**: `EQUAL? .RARG ,M-END AND EQUAL? .RARG ,M-END AND EQUAL? ,PRSO ,CANDLES ,TORCH ,MATCH AND FSET? ,CANDLES ,ONBIT AND FSET? ,TORCH ,ONBIT AND FSET? ,MATCH ,ONBIT`

---

## GUNK (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2555

**Message**: "The slag was rather insubstantial, and crumbles into dust at your touch."

**Object**: GUNK

**Condition**: `IN? ,COAL ,MACHINE`

---

## SCEPTRE (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2618

**Message**: "A dazzling display of color briefly emanates from the sceptre."

**Object**: SCEPTRE

**Condition**: `EQUAL? ,HERE ,ON-RAINBOW`

---

## RBOAT (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2735

**Message**: "Read the label for the boat's instructions."

**Verb**: WALK

**Object**: RBOAT

**Condition**: `EQUAL? .RARG ,M-ENTER ,M-END ,M-LOOK AND EQUAL? .RARG ,M-BEG AND EQUAL? ,PRSO ,P?LAND ,P?EAST ,P?WEST AND EQUAL? ,HERE ,RESERVOIR AND EQUAL? ,PRSO ,P?NORTH ,P?SOUTH AND EQUAL? ,HERE ,IN-STREAM AND EQUAL? ,PRSO ,P?SOUTH`

---

## RIVR4 (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2847

**Message**: "You notice something funny about the feel of the buoy."

**Object**: RIVR4

**Condition**: `EQUAL? ,PRSI ,LUNGS AND EQUAL? .RARG ,M-END AND IN? ,BUOY ,WINNER`

---

## TREE (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:2905

**Message**: "The egg falls to the ground and springs open, seriously damaged. The  falls to the ground."

**Verb**: DROP

**Object**: TREE

**Condition**: `EQUAL? .RARG ,M-BEG AND EQUAL? ,PRSO ,TREE ,ROOMS AND EQUAL? ,PRSO ,TREE AND EQUAL? ,PRSO ,NEST AND IN? ,EGG ,NEST AND EQUAL? ,PRSO ,EGG`

---

## CLIFF (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:3018

**Message**: "That would be very unwise. Perhaps even fatal."

**Verb**: CLIMB-UP

**Object**: CLIFF

**Condition**: `EQUAL? .RARG ,M-ENTER AND EQUAL? .RARG ,M-BEG AND EQUAL? ,PRSO ,TREE AND EQUAL? ,PRSO ,ME`

---

## SLIDE (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:3093

**Message**: "You tumble down the slide...."

**Verb**: THROUGH

**Object**: SLIDE

**Condition**: `EQUAL? ,PRSO ,ROPE AND EQUAL? ,PRSI ,RAILING AND EQUAL? ,PRSO ,ME AND EQUAL? ,HERE ,CELLAR`

---

## SANDWICH (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:3109

**Message**: "It smells of hot peppers."

**Verb**: SMELL

**Object**: SANDWICH

**Condition**: `FSET? .OBJ ,TAKEBIT AND EQUAL? .OBJ ,WATER AND IN? ,LUNCH ,PRSO`

---

## LAKE (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:3179

**Message**: "There's not much lake left...."

**Verb**: CROSS

**Object**: LAKE

---

## DOOR (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:3218

**Message**: "The door won't budge."

**Verb**: THROUGH

**Object**: DOOR

---

## PAINT (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:3224

**Message**: "Some paint chips away, revealing more paint."

**Verb**: OPEN

**Object**: PAINT

---

## GAS (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:3228

**Message**: "There is too much gas to blow away."

**Verb**: THROUGH

**Object**: GAS

---

## HERO (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### 1actions.zil:3499

**Message**: "Attacking the"

**Object**: HERO

**Condition**: `FSET? ,WINNER ,STAGGERED AND EQUAL? ,PRSO ,WINNER`

---

## JIGS (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:4056

**Message**: "Bad luck, huh?"

**Object**: JIGS

---

## CHAIN (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### 1actions.zil:4173

**Message**: "The chain secures a basket within the shaft."

**Verb**: TAKE

**Object**: CHAIN

---

## GRUE (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### gglobals.zil:205

**Message**: "It makes no sound but is always lurking in the darkness nearby."

**Verb**: FIND

**Object**: GRUE

---

## ZORKMID (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### gglobals.zil:301

**Message**: "The best way to find zorkmids is to go out and look for them."

**Verb**: EXAMINE

**Object**: ZORKMID

---

## PERFORM (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### gmain.zil:238

**Message**: "** PERFORM: PRSA ="

---

## TELL (1 messages)

**Priority**: LOW  
**Estimated Effort**: 15-30 min

### Messages

#### gverbs.zil:241

**Message**: "You didn't say with what!"

**Object**: TELL

---

## FIRSTER (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### gverbs.zil:1821

**Message**: "Your collection of treasures consists of:"

**Condition**: `EQUAL? .OBJ ,TROPHY-CASE`

---

## SCORE (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### gverbs.zil:1860

**Message**: "An almost inaudible voice whispers in your ear, \"

**Object**: SCORE

**Condition**: `EQUAL? ,SCORE 350`

---

## GOTO (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### gverbs.zil:2080

**Message**: "The balloon lands."

**Condition**: `FSET? .RM ,RMUNGBIT AND FSET? ,HERE ,RLANDBIT AND FSET? .WLOC ,VEHBIT AND EQUAL? .WLOC ,BALLOON`

---

## GET (1 messages)

**Priority**: LOW  
**Estimated Effort**: 1-2 hours

### Messages

#### gparser.zil:1065

**Message**: "There seems to be a noun missing in that sentence!"

**Object**: GET

**Condition**: `EQUAL? ,P-GETFLAGS ,P-ALL`

---

