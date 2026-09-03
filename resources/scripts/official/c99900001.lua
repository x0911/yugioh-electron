-- Elemental HERO Egyxos
-- Custom DIVINE Divine-Beast Ancient Egyptian Golden Dragon Fusion Monster
local s, id = GetID()
function s.initial_effect(c)
	-- Must be Special Summoned by its own effect and cannot be Special Summoned by other ways (No Polymerization)
	c:EnableReviveLimit()
	local e0 = Effect.CreateEffect(c)
	e0:SetType(EFFECT_TYPE_SINGLE)
	e0:SetProperty(EFFECT_FLAG_CANNOT_DISABLE + EFFECT_FLAG_UNCOPYABLE)
	e0:SetCode(EFFECT_SPSUMMON_CONDITION)
	e0:SetValue(aux.FALSE)
	c:RegisterEffect(e0)

	-- Contact Special Summon from Extra Deck
	local e1 = Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(id, 0))
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE + EFFECT_FLAG_CANNOT_DISABLE)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetRange(LOCATION_EXTRA)
	e1:SetCondition(s.spcon)
	e1:SetTarget(s.sptg)
	e1:SetOperation(s.spop)
	c:RegisterEffect(e1)

	-- (10) Wrath of the Divine Dragon: If destroyed (by battle or card effect) and sent to GY
	-- Halve opponent LP, destroy all cards opponent controls, and Special Summon up to 5 HEROes from Deck
	local e3 = Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(id, 7))
	e3:SetCategory(CATEGORY_DESTROY + CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_SINGLE + EFFECT_TYPE_TRIGGER_F)
	e3:SetProperty(EFFECT_FLAG_DELAY + EFFECT_FLAG_DAMAGE_STEP)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCondition(s.deckspcon)
	e3:SetTarget(s.decksptg)
	e3:SetOperation(s.deckspop)
	c:RegisterEffect(e3)
end

s.listed_series = { 0x3008 }

function s.contactfilter(c)
	return c:IsSetCard(0x3008) and c:IsType(TYPE_MONSTER) and (c:IsAbleToDeckOrExtraAsCost() or c:IsAbleToDeckAsCost() or c:IsAbleToExtraAsCost())
end

function s.rescon(sg, e, tp, mg)
	return Duel.GetLocationCountFromEx(tp, tp, sg, e:GetHandler()) > 0
end

function s.spcon(e, c)
	if c == nil then return true end
	local tp = c:GetControler()
	local rg = Duel.GetMatchingGroup(s.contactfilter, tp, LOCATION_HAND + LOCATION_ONFIELD + LOCATION_GRAVE, 0, nil)
	return #rg > 0 and aux.SelectUnselectGroup(rg, e, tp, 1, #rg, s.rescon, 0)
end

function s.sptg(e, tp, eg, ep, ev, re, r, rp, chk, c)
	local rg = Duel.GetMatchingGroup(s.contactfilter, tp, LOCATION_HAND + LOCATION_ONFIELD + LOCATION_GRAVE, 0, nil)
	local g = aux.SelectUnselectGroup(rg, e, tp, 1, #rg, s.rescon, 1, tp, HINTMSG_TODECK, s.rescon, nil, true)
	if #g > 0 then
		g:KeepAlive()
		e:SetLabelObject(g)
		return true
	end
	return false
end

function s.spop(e, tp, eg, ep, ev, re, r, rp, c)
	local g = e:GetLabelObject()
	if not g then return end
	c:SetMaterial(g)
	s.apply_material_bonuses(c, g)
	Duel.SendtoDeck(g, nil, SEQ_DECKSHUFFLE, REASON_COST + REASON_MATERIAL)
	g:DeleteGroup()
end

function s.apply_material_bonuses(c, g)
	local atk = 0
	local def = 0
	local hasLight = false
	local hasEarth = false
	local hasWater = false
	local hasFire = false
	local hasWind = false
	local hasDark = false

	local tc = g:GetFirst()
	while tc do
		local batk = tc:GetBaseAttack()
		local bdef = tc:GetBaseDefense()
		if batk > 0 then atk = atk + batk end
		if bdef > 0 then def = def + bdef end
		if tc:IsAttribute(ATTRIBUTE_LIGHT) then hasLight = true end
		if tc:IsAttribute(ATTRIBUTE_EARTH) then hasEarth = true end
		if tc:IsAttribute(ATTRIBUTE_WATER) then hasWater = true end
		if tc:IsAttribute(ATTRIBUTE_FIRE) then hasFire = true end
		if tc:IsAttribute(ATTRIBUTE_WIND) then hasWind = true end
		if tc:IsAttribute(ATTRIBUTE_DARK) then hasDark = true end
		tc = g:GetNext()
	end

	-- (8) WIND: ATK doubled
	if hasWind then
		atk = atk * 2
	end

	-- Exclude RESET_TOFIELD so stats & effects are not reset when moving from Extra Deck to field
	local reset_flags = RESET_EVENT + (RESETS_STANDARD_DISABLE - RESET_TOFIELD)
	local reset_flags_normal = RESET_EVENT + (RESETS_STANDARD - RESET_TOFIELD)

	-- (2) Original ATK
	local e1 = Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SET_BASE_ATTACK)
	e1:SetValue(atk)
	e1:SetReset(reset_flags)
	c:RegisterEffect(e1)

	-- (3) Original DEF
	local e2 = Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_SET_BASE_DEFENSE)
	e2:SetValue(def)
	e2:SetReset(reset_flags)
	c:RegisterEffect(e2)

	-- (4) LIGHT: Unaffected by Trap Cards
	if hasLight then
		local e3 = Effect.CreateEffect(c)
		e3:SetDescription(aux.Stringid(id, 1))
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE + EFFECT_FLAG_CLIENT_HINT)
		e3:SetRange(LOCATION_MZONE)
		e3:SetCode(EFFECT_IMMUNE_EFFECT)
		e3:SetValue(s.efilter_trap)
		e3:SetReset(reset_flags_normal)
		c:RegisterEffect(e3)
	end

	-- (5) EARTH: Unaffected by Spell Cards
	if hasEarth then
		local e4 = Effect.CreateEffect(c)
		e4:SetDescription(aux.Stringid(id, 2))
		e4:SetType(EFFECT_TYPE_SINGLE)
		e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE + EFFECT_FLAG_CLIENT_HINT)
		e4:SetRange(LOCATION_MZONE)
		e4:SetCode(EFFECT_IMMUNE_EFFECT)
		e4:SetValue(s.efilter_spell)
		e4:SetReset(reset_flags_normal)
		c:RegisterEffect(e4)
	end

	-- (6) WATER: Unaffected by Monster Effects
	if hasWater then
		local e5 = Effect.CreateEffect(c)
		e5:SetDescription(aux.Stringid(id, 3))
		e5:SetType(EFFECT_TYPE_SINGLE)
		e5:SetProperty(EFFECT_FLAG_SINGLE_RANGE + EFFECT_FLAG_CLIENT_HINT)
		e5:SetRange(LOCATION_MZONE)
		e5:SetCode(EFFECT_IMMUNE_EFFECT)
		e5:SetValue(s.efilter_monster)
		e5:SetReset(reset_flags_normal)
		c:RegisterEffect(e5)
	end

	-- (7) FIRE: Can attack twice during each Battle Phase
	if hasFire then
		local e6 = Effect.CreateEffect(c)
		e6:SetDescription(aux.Stringid(id, 4))
		e6:SetType(EFFECT_TYPE_SINGLE)
		e6:SetProperty(EFFECT_FLAG_SINGLE_RANGE + EFFECT_FLAG_CLIENT_HINT)
		e6:SetRange(LOCATION_MZONE)
		e6:SetCode(EFFECT_EXTRA_ATTACK)
		e6:SetValue(1)
		e6:SetReset(reset_flags_normal)
		c:RegisterEffect(e6)
	end

	-- (9) DARK: Cannot be destroyed by battle
	if hasDark then
		local e7 = Effect.CreateEffect(c)
		e7:SetDescription(aux.Stringid(id, 6))
		e7:SetType(EFFECT_TYPE_SINGLE)
		e7:SetProperty(EFFECT_FLAG_SINGLE_RANGE + EFFECT_FLAG_CLIENT_HINT)
		e7:SetRange(LOCATION_MZONE)
		e7:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
		e7:SetValue(1)
		e7:SetReset(reset_flags_normal)
		c:RegisterEffect(e7)
	end
end

function s.efilter_trap(e, te)
	return te:IsActiveType(TYPE_TRAP)
end

function s.efilter_spell(e, te)
	return te:IsActiveType(TYPE_SPELL)
end

function s.efilter_monster(e, te)
	return te:IsActiveType(TYPE_MONSTER) and te:GetOwner() ~= e:GetHandler()
end

-- (10) Wrath of the Divine Dragon: When destroyed and sent to GY
-- Halve opponent LP, destroy all cards opponent controls, and Special Summon up to 5 HEROes from Deck
function s.deckspcon(e, tp, eg, ep, ev, re, r, rp)
	local c = e:GetHandler()
	return c:IsReason(REASON_DESTROY)
end

function s.deckspfilter(c, e, tp)
	return c:IsSetCard(0x3008) and c:IsType(TYPE_MONSTER) and c:IsCanBeSpecialSummoned(e, 0, tp, false, false)
end

function s.decksptg(e, tp, eg, ep, ev, re, r, rp, chk)
	if chk == 0 then return true end
	local g = Duel.GetFieldGroup(tp, 0, LOCATION_ONFIELD)
	Duel.SetOperationInfo(0, CATEGORY_DESTROY, g, #g, 0, 0)
	Duel.SetPossibleOperationInfo(0, CATEGORY_SPECIAL_SUMMON, nil, 1, tp, LOCATION_DECK)
end

function s.deckspop(e, tp, eg, ep, ev, re, r, rp)
	-- 1. Cut opponent LP to half
	local lp = Duel.GetLP(1 - tp)
	Duel.SetLP(1 - tp, math.ceil(lp / 2))

	-- 2. Destroy all opponent's monsters, spells, and traps on the field
	local dg = Duel.GetFieldGroup(tp, 0, LOCATION_ONFIELD)
	if #dg > 0 then
		Duel.Destroy(dg, REASON_EFFECT)
	end

	-- 3. Special Summon up to 5 "Elemental HERO" monsters from Deck
	local ft = Duel.GetLocationCount(tp, LOCATION_MZONE)
	if ft > 0 and Duel.IsExistingMatchingCard(s.deckspfilter, tp, LOCATION_DECK, 0, 1, nil, e, tp) then
		if Duel.SelectYesNo(tp, aux.Stringid(id, 8)) then
			local max = math.min(ft, 5)
			local g = Duel.GetMatchingGroup(s.deckspfilter, tp, LOCATION_DECK, 0, nil, e, tp)
			if #g > 0 then
				Duel.Hint(HINT_SELECTMSG, tp, HINTMSG_SPSUMMON)
				local sg = g:Select(tp, 1, max, nil)
				if #sg > 0 then
					Duel.SpecialSummon(sg, 0, tp, tp, false, false, POS_FACEUP)
				end
			end
		end
	end
end
