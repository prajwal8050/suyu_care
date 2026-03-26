const ingredientsData = {
    "Kojic Acid": {
        desc: "A natural skin brightener derived from fungi. It inhibits melanin production.",
        benefits: "Reduces dark spots, evens skin tone, and has antifungal properties.",
        sideEffects: "May cause dermatitis or skin sensitivity in higher concentrations.",
        usage: "Brightening Serums, Creams."
    },
    "Vitamin C": {
        desc: "A potent antioxidant that neutralizes free radicals and boosts collagen.",
        benefits: "Brightens skin, reduces hyperpigmentation, and protects against UV damage.",
        sideEffects: "Mild stinging, redness, or dryness if used in high concentrations.",
        usage: "Radience Serums, Face Washes."
    },
    "Hyaluronic Acid": {
        desc: "A powerful humectant that can hold up to 1000 times its weight in water.",
        benefits: "Intense hydration, plumps skin, and reduces the appearance of fine lines.",
        sideEffects: "Extremely safe, but can draw moisture *out* of skin in very dry climates if not sealed.",
        usage: "Moisturizers, Hydration Serums."
    },
    "Salicylic Acid": {
        desc: "A Beta-Hydroxy Acid (BHA) that exfoliates deep inside the pores.",
        benefits: "Clears acne, reduces oiliness, and dissolves blackheads.",
        sideEffects: "Excessive drying, peeling, or irritation.",
        usage: "Acne Treatments, Pore Cleansers."
    },
    "Niacinamide": {
        desc: "A form of Vitamin B3 that strengthens the skin barrier and regulates oil.",
        benefits: "Minimizes pores, improves skin texture, and reduces redness.",
        sideEffects: "Rare; some may experience flushing or breakouts.",
        usage: "Repair Serums, Toners."
    },
    "Retinol": {
        desc: "A derivative of Vitamin A that speeds up cell turnover and collagen production.",
        benefits: "Anti-aging, reduces wrinkles, and improves skin thickness.",
        sideEffects: "Redness, peeling, and increased sun sensitivity (Retinization).",
        usage: "Night Creams, Eye Serums."
    },
    "Glycolic Acid": {
        desc: "An Alpha-Hydroxy Acid (AHA) with the smallest molecular size for deep exfoliation.",
        benefits: "Smoothens skin texture, brightens dullness, and improves absorption.",
        sideEffects: "Sun sensitivity, tingling, or chemical burns if overused.",
        usage: "Exfoliating Solutions, Peels."
    },
    "Lactic Acid": {
        desc: "A gentler AHA that exfoliates while also providing hydration.",
        benefits: "Smoothens skin, brightens, and is suitable for sensitive skin.",
        sideEffects: "Mild irritation or sun sensitivity.",
        usage: "Body Lotions, Gentle Peels."
    },
    "Ceramides": {
        desc: "Lipids that make up 50% of the skin's natural barrier.",
        benefits: "Restores skin barrier, locks in moisture, and protects against pollutants.",
        sideEffects: "Non-irritating; suitable for all skin types.",
        usage: "Barrier Repair Creams, Lotions."
    },
    "Benzoyl Peroxide": {
        desc: "An antimicrobial ingredient that kills acne-causing bacteria.",
        benefits: "Effectively treats cystic acne and prevents new breakouts.",
        sideEffects: "Bleaches fabric, causes dryness and significant peeling.",
        usage: "Spot Treatments, Acne Washes."
    },
    "Tea Tree Oil": {
        desc: "A natural essential oil with strong antiseptic and anti-inflammatory properties.",
        benefits: "Soothes acne, treats dandruff, and acts as a natural disinfectant.",
        sideEffects: "Can be very drying or cause allergic reactions if not diluted.",
        usage: "Spot Treatments, Scalp Serums."
    },
    "Aloe Vera": {
        desc: "A succulent plant jelly known for its cooling and wound-healing properties.",
        benefits: "Soothes burns, hydrates, and reduces skin inflammation.",
        sideEffects: "Generally safe; rare allergic reactions.",
        usage: "After-sun Gels, Soothing Masks."
    },
    "Argan Oil": {
        desc: "Liquid gold' from Morocco, rich in fatty acids and Vitamin E.",
        benefits: "Deeply nourishes hair, prevents breakage, and adds healthy shine.",
        sideEffects: "Can clog pores if you have very oily skin.",
        usage: "Hair Oils, Shampoos."
    },
    "Keratin": {
        desc: "The structural protein that makes up your hair, skin, and nails.",
        benefits: "Strengthens hair shafts, reduces frizz, and repairs damage.",
        sideEffects: "Overuse can lead to 'protein overload,' making hair brittle.",
        usage: "Hair Masks, Conditioners."
    },
    "Biotin": {
        desc: "Also known as Vitamin B7, essential for infrastructure of keratin.",
        benefits: "Improves hair thickness and stimulates growth.",
        sideEffects: "Topical use is very safe; no major side effects.",
        usage: "Hair Loss Serums, Supplements."
    },
    "Caffeine": {
        desc: "A stimulant that constricts blood vessels and energizes cells.",
        benefits: "Reduces puffiness under eyes and stimulates hair follicles.",
        sideEffects: "Temporary jitteriness or redness if concentrated.",
        usage: "Eye Creams, Scalp Stimulators."
    },
    "Coconut Oil": {
        desc: "A highly penetrative oil rich in lauric acid.",
        benefits: "Excellent pre-wash hair treatment to prevent protein loss.",
        sideEffects: "Comedogenic; can cause severe breakouts if used on the face.",
        usage: "Hair Masks, Body Butters."
    },
    "Shea Butter": {
        desc: "A fat extracted from the nut of the African shea tree.",
        benefits: "Intense emollient that softens skin and seals in moisture.",
        sideEffects: "Generally safe, but heavy for very oily skin.",
        usage: "Body Creams, Lip Balms."
    }
};

const interactionMatrix = {
    "Retinol": {
        "Benzoyl Peroxide": { status: "bad", reason: "Benzoyl Peroxide can deactivate Retinol molecules, making both ineffective and causing excessive dryness.", effect: "Product Deactivation & Irritation" },
        "Salicylic Acid": { status: "bad", reason: "Both increase cell turnover; mixing them causes extreme irritation, peeling, and can damage the skin barrier.", effect: "Severe Irritation & Peeling" },
        "Glycolic Acid": { status: "caution", reason: "Mixing two potent exfoliants can lead to over-exfoliation. Use on alternate nights.", effect: "Extreme Sensitivity" },
        "Vitamin C": { status: "caution", reason: "They work at different pH levels. Best used as Vitamin C in the morning and Retinol at night.", effect: "Reduced Effectiveness" },
        "Hyaluronic Acid": { status: "good", reason: "Hyaluronic solution soothes the potential dryness caused by Retinol.", effect: "Soothing & Hydrating" }
    },
    "Vitamin C": {
        "Niacinamide": { status: "caution", reason: "In some older formulations, they could cause flushing. Modern research says they are fine, but sensitive skin should use them 15 mins apart.", effect: "Possible Skin Flushing", resultingCompound: "Niacinamide Ascorbate (Complex)" },
        "Salicylic Acid": { status: "caution", reason: "The low pH of Vitamin C combined with BHA can be irritating for some.", effect: "Acid Sensitivity" },
        "Retinol": { status: "caution", reason: "Use Vitamin C in AM for protection and Retinol in PM for repair.", effect: "Optimization of Benefits" },
        "Kojic Acid": { status: "good", reason: "A powerhouse brightening duo that targets hyperpigmentation from two different angles.", effect: "Advanced Brightening (Glow Duo)" }
    },
    "Niacinamide": {
        "Salicylic Acid": { status: "good", reason: "Niacinamide helps soothe the irritation that BHA might cause, while both regulate oil.", effect: "Pore Refining & Oil Control" },
        "Hyaluronic Acid": { status: "good", reason: "A perfect hydration and barrier-building pair.", effect: "Plumping & Shielding" }
    },
    "Benzoyl Peroxide": {
        "Tea Tree Oil": { status: "caution", reason: "Both are very drying. Using them together can lead to flaky, sensitized skin.", effect: "Dehydration" }
    },
    "Hyaluronic Acid": {
        "Ceramides": { status: "good", reason: "Ceramides lock in the moisture that Hyaluronic Acid draws into the skin.", effect: "Perfect Barrier Combo" }
    }
};

// Initialize Selects
const select1 = document.getElementById('ing-1');
const select2 = document.getElementById('ing-2');
const checkBtn = document.getElementById('check-btn');
const resultCard = document.getElementById('result-card');

function populateSelects() {
    const sortedIngs = Object.keys(ingredientsData).sort();
    sortedIngs.forEach(ing => {
        const opt1 = new Option(ing, ing);
        const opt2 = new Option(ing, ing);
        select1.add(opt1);
        select2.add(opt2);
    });
}

function checkInteraction() {
    const val1 = select1.value;
    const val2 = select2.value;

    if (!val1 || !val2) {
        alert("Please select two ingredients to check.");
        return;
    }

    if (val1 === val2) {
        alert("Please select two different ingredients.");
        return;
    }

    let result = null;

    // Check matrix (bidirectional)
    if (interactionMatrix[val1] && interactionMatrix[val1][val2]) {
        result = interactionMatrix[val1][val2];
    } else if (interactionMatrix[val2] && interactionMatrix[val2][val1]) {
        result = interactionMatrix[val2][val1];
    } else {
        // Default to Good if no negative interaction is known
        result = {
            status: "good",
            reason: "These ingredients have no known negative interaction and are generally safe to use together.",
            effect: "Safe for layered application."
        };
    }

    displayResult(result, val1, val2);
}

function displayResult(result, val1, val2) {
    const statusHeader = document.getElementById('status-header');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const compoundsSpan = document.getElementById('resulting-compound');

    const reasonText = document.getElementById('reason-text');
    const effectText = document.getElementById('effect-text');

    // Update Header
    statusHeader.className = 'status-header ' + result.status;
    if (result.status === 'good') {
        statusIcon.className = 'fa-solid fa-circle-check';
        statusText.textContent = "Safe Combination";
    } else if (result.status === 'caution') {
        statusIcon.className = 'fa-solid fa-triangle-exclamation';
        statusText.textContent = "Use With Caution";
    } else {
        statusIcon.className = 'fa-solid fa-circle-xmark';
        statusText.textContent = "Avoid Combination";
    }

    compoundsSpan.textContent = result.resultingCompound ? `Result: ${result.resultingCompound}` : "";

    // Update Details
    reasonText.textContent = result.reason;
    effectText.textContent = result.effect;

    // Update Ingredient Info
    updateIngInfo(1, val1);
    updateIngInfo(2, val2);

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateIngInfo(num, name) {
    const data = ingredientsData[name];
    document.getElementById(`ing-name-${num}`).textContent = name;
    document.getElementById(`ing-desc-${num}`).textContent = data.desc;
    document.getElementById(`ing-side-${num}`).textContent = data.sideEffects;
}

// Event Listeners
populateSelects();
checkBtn.addEventListener('click', checkInteraction);
