-- Kindred Summoning
-- Custom Normal Spell Card (ID: 89900001)
local s, id = GetID()
function s.initial_effect(c)
	-- Activate
	local e1 = Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(id, 0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(s.target)
	e1:SetOperation(s.activate)
	c:RegisterEffect(e1)
end

function s.tcfilter(c, e, tp)
	return c:IsFaceup() and Duel.IsExistingMatchingCard(s.spfilter, tp, LOCATION_HAND + LOCATION_DECK + LOCATION_GRAVE, 0, 1, nil, e, tp, c:GetRace())
end

function s.spfilter(c, e, tp, race)
	return c:IsRace(race) and c:IsCanBeSpecialSummoned(e, 0, tp, true, false)
end

function s.target(e, tp, eg, ep, ev, re, r, rp, chk, chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and s.tcfilter(chkc, e, tp) end
	if chk == 0 then
		return Duel.GetLocationCount(tp, LOCATION_MZONE) > 0
			and Duel.IsExistingTarget(s.tcfilter, tp, LOCATION_MZONE, 0, 1, nil, e, tp)
	end
	Duel.Hint(HINT_SELECTMSG, tp, HINTMSG_TARGET)
	Duel.SelectTarget(tp, s.tcfilter, tp, LOCATION_MZONE, 0, 1, 1, nil, e, tp)
	Duel.SetOperationInfo(0, CATEGORY_SPECIAL_SUMMON, nil, 1, tp, LOCATION_HAND + LOCATION_DECK + LOCATION_GRAVE)
end

function s.activate(e, tp, eg, ep, ev, re, r, rp)
	local tc = Duel.GetFirstTarget()
	if not tc or not tc:IsRelateToEffect(e) or tc:IsFacedown() then return end
	local ft = Duel.GetLocationCount(tp, LOCATION_MZONE)
	if ft <= 0 then return end
	if Duel.IsPlayerAffectedByEffect(tp, CARD_BLUEEYES_SPIRIT) then ft = 1 end

	local g = Duel.GetMatchingGroup(s.spfilter, tp, LOCATION_HAND + LOCATION_DECK + LOCATION_GRAVE, 0, nil, e, tp, tc:GetRace())
	if #g == 0 then return end

	Duel.Hint(HINT_SELECTMSG, tp, HINTMSG_SPSUMMON)
	local count = math.min(ft, #g)
	local sg = g:Select(tp, 1, count, nil)
	if #sg > 0 then
		local shuffle_deck = false
		for sc in aux.Next(sg) do
			if sc:IsLocation(LOCATION_DECK) then shuffle_deck = true end
			Duel.SpecialSummonStep(sc, 0, tp, tp, true, false, POS_FACEUP)
		end
		Duel.SpecialSummonComplete()
		if shuffle_deck then
			Duel.ShuffleDeck(tp)
		end
	end
end
