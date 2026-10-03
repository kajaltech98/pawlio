/**
 * PAWLIO Pet Care Knowledge & Blog Data
 * Authoritative, educational, trustworthy pet-care articles.
 * Disclaimer: General information only. For health concerns, consult a qualified veterinarian.
 */

export const BLOG_CATEGORIES = [
  "All",
  "Health",
  "Nutrition",
  "Grooming",
  "Vaccination",
  "Behavior",
  "Daily Care",
  "Puppy & Kitten",
  "Senior Care",
];

export const BLOG_POSTS = [
  {
    id: "blog-01",
    slug: "everyday-habits-healthier-pet",
    title: "5 Everyday Habits That Support a Healthier Pet",
    category: "Health",
    isFeatured: true,
    excerpt:
      "Consistent small routines can make preventive pet care straightforward. Learn how hydration, daily baseline checks, and planned activity support long-term wellbeing.",
    readingTime: "5 min read",
    publishedAt: "October 1, 2026",
    author: "PAWLIO Veterinary Care Team",
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=85",
    tags: ["Preventive Care", "Daily Routine", "Wellness", "Hydration"],
    intro:
      "Caring for a companion animal is built on what you do every day rather than sporadic clinic visits alone. Just as human health relies on consistent lifestyle habits, pets flourish when daily routines provide predictability, physical baseline monitoring, and preventive care.",
    quickTakeaways: [
      "Check your pet's physical baseline daily (coat, ears, gums, gait).",
      "Wash water bowls daily and ensure multiple clean hydration stations.",
      "Portion food with measuring cups to avoid gradual weight creep.",
      "Incorporate 15 minutes of mental enrichment alongside physical exercise.",
      "Keep a centralized digital record of any shifts in weight or appetite.",
    ],
    pawlioTip:
      "Log subtle changes early. A 5% drop in water intake or a slight change in morning pace can be the first clue to dental sensitivity or early joint stiffness.",
    sections: [
      {
        heading: "1. Conduct a 60-Second Physical Baseline Check",
        content: [
          "Every morning or evening during petting, take sixty seconds to observe your companion from nose to tail. Run your hands along their sides to gauge rib palpability, inspect the inner ears for redness or odor, and gently lift the jowls to check that gums are a healthy salmon pink rather than pale or inflamed.",
          "Early detection is the cornerstone of veterinary medicine. When you know what is normal for your specific dog or cat, you can identify lumps, skin sensitivities, or localized tenderness weeks before they escalate into painful emergencies.",
        ],
      },
      {
        heading: "2. Prioritize Fresh Hydration & Clean Water Stations",
        content: [
          "Hydration is critical for kidney function, joint lubrication, and digestion. In many homes, pet bowls are refilled without being scrubbed, allowing bacterial biofilm to accumulate on ceramic or stainless steel surfaces.",
          "Wash water bowls daily with warm soapy water and position stations away from noisy appliances or litter boxes. For cats, running water fountains often stimulate 30% higher fluid consumption, helping prevent feline lower urinary tract issues.",
        ],
      },
      {
        heading: "3. Measure Food Portions with Precision",
        content: [
          "Estimating kibble or wet food by eye is one of the most common causes of canine and feline obesity. An extra handful of food each day can easily add 20% to your pet's caloric intake, leading to excess stress on joints and increased cardiovascular strain.",
          "Use a standard measuring cup or kitchen scale calibrated to your veterinarian's recommended caloric target. Account for training treats in the daily caloric budget, adjusting morning or evening meals accordingly.",
        ],
      },
      {
        heading: "4. Pair Physical Exercise with Mental Enrichment",
        content: [
          "Physical exercise is vital, but mental exertion is equally exhausting and satisfying for active companions. Sniff walks ('decompression walks') where dogs lead the route at their own pace satisfy instinctive foraging behaviors.",
          "Introduce puzzle feeders, licky mats, and scent-work games. For indoor cats, vertical climbing trees, feather wands, and window perches provide essential predatory simulation that keeps cognitive function sharp.",
        ],
      },
      {
        heading: "5. Maintain Centralized Digital Health Records",
        content: [
          "When you visit a veterinarian or emergency clinic, having instant access to immunization dates, past medication dosages, and baseline blood work eliminates guesswork and repeat diagnostics.",
          "Centralizing your pet's passport in PAWLIO ensures you never miss an annual booster or preventive flea and tick treatment window, giving you total peace of mind.",
        ],
      },
    ],
  },
  {
    id: "blog-02",
    slug: "basics-balanced-pet-nutrition",
    title: "Understanding the Basics of Balanced Pet Nutrition",
    category: "Nutrition",
    isFeatured: false,
    excerpt:
      "From protein quality to life-stage feeding guidelines, explore how balanced nutrients power your pet's energy, coat condition, and digestive health.",
    readingTime: "6 min read",
    publishedAt: "September 28, 2026",
    author: "PAWLIO Clinical Editorial",
    image:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1000&q=85",
    tags: ["Nutrition", "Diet", "Digestive Health", "Feeding Guide"],
    intro:
      "Selecting the right food for your pet can feel overwhelming amidst marketing jargon and competing trends. Understanding the core nutritional requirements of dogs (omnivores) and cats (obligate carnivores) empowers you to make grounded, science-backed choices.",
    quickTakeaways: [
      "Cats require dietary taurine and higher protein; dogs require balanced macronutrients.",
      "Check for certified nutritional adequacy statements (e.g. AAFCO compliance).",
      "Transition between foods gradually over 7 to 10 days to protect the gut microbiome.",
      "Beware of feeding toxic human foods such as grapes, onions, chocolate, and xylitol.",
    ],
    pawlioTip:
      "Never switch pet foods overnight. Blend 25% new food with 75% old food for three days, then 50/50, then 75/25 to prevent acute gastrointestinal upset.",
    sections: [
      {
        heading: "Macronutrients: What Your Pet Truly Needs",
        content: [
          "Proteins deliver the amino acids responsible for muscle maintenance, tissue repair, and enzyme synthesis. Fats furnish concentrated energy, support cellular membranes, and supply omega-3 and omega-6 fatty acids for skin barrier health.",
          "Digestible carbohydrates offer sustained glucose and prebiotic fiber that nourishes beneficial gut bacteria, promoting firm stool consistency and balanced digestion.",
        ],
      },
      {
        heading: "Life-Stage Nutrition: Puppies, Adults, and Seniors",
        content: [
          "Nutritional requirements shift dramatically across life stages. Growing puppies and kittens require elevated calcium, phosphorus, and DHA for skeletal and neurological development.",
          "Adult pets require maintenance formulas that prevent caloric excess, while senior pets benefit from joint-supporting glucosamine, moderated sodium, and easily digestible proteins that spare kidney workload.",
        ],
      },
      {
        heading: "Safe Food Storage & Feeding Hygiene",
        content: [
          "Keep dry kibble in its original bag sealed inside an airtight bin to prevent lipid oxidation and preserve vitamin potency. Store opened canned food covered in the refrigerator and discard uneaten wet food after 4 hours at room temperature.",
        ],
      },
    ],
  },
  {
    id: "blog-03",
    slug: "how-often-should-you-groom-your-pet",
    title: "How Often Should You Groom Your Pet? A Practical Guide",
    category: "Grooming",
    isFeatured: false,
    excerpt:
      "Grooming needs vary greatly by coat type, breed, and activity. Here is a practical schedule for coat brushing, nail trimming, and ear hygiene.",
    readingTime: "4 min read",
    publishedAt: "September 24, 2026",
    author: "PAWLIO Grooming Specialists",
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=85",
    tags: ["Grooming", "Coat Care", "Nail Trimming", "Hygiene"],
    intro:
      "Grooming is far more than an aesthetic ritual. Regular coat maintenance, nail clipping, and ear cleaning prevent painful matting, skin dermatitis, and postural abnormalities caused by overgrown claws.",
    quickTakeaways: [
      "Double-coated breeds need weekly de-shedding but should never be shaved down.",
      "Trim nails every 3 to 4 weeks to avoid quick elongation and skeletal misalignment.",
      "Check ears weekly for dark wax, yeast odor, or moisture buildup.",
      "Use only pH-balanced pet shampoos; human products strip essential sebum barriers.",
    ],
    pawlioTip:
      "If you hear your dog's nails clicking loudly against hard floors, they are already overdue for a trim. Short nails support correct paw alignment and pain-free walking.",
    sections: [
      {
        heading: "Brushing Frequency by Coat Classification",
        content: [
          "Short, smooth coats (such as Boxers or Beagles) benefit from a weekly curry-comb session to remove dead dander and distribute natural skin oils.",
          "Medium to long double coats (such as Golden Retrievers or Huskies) demand two to three thorough brushing sessions weekly with an undercoat rake to avoid dense matting during seasonal shedding cycles.",
          "Curly and non-shedding coats (such as Poodles or Doodles) require daily slicker brushing and line combing down to the skin to avoid felted mats that trap moisture.",
        ],
      },
      {
        heading: "Nail Care & Ear Hygiene Essentials",
        content: [
          "Overgrown nails alter the angle of your pet's foot pads, putting unnatural pressure on carpal and spinal joints. Aim for a trim every three to four weeks, taking small slivers to avoid nicking the vascular quick.",
          "Clean floppy or hairy ears with an alcohol-free veterinary cleanser after swimming or bathing. Never insert cotton swabs deep into the ear canal.",
        ],
      },
    ],
  },
  {
    id: "blog-04",
    slug: "why-keeping-vaccination-records-organized-matters",
    title: "Why Keeping Vaccination Records Organized Matters",
    category: "Vaccination",
    isFeatured: false,
    excerpt:
      "Core vs. lifestyle boosters, boarding facility compliance, and travel rules: why a verified digital immunization log protects your companion.",
    readingTime: "5 min read",
    publishedAt: "September 20, 2026",
    author: "PAWLIO Veterinary Care Team",
    image:
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1000&q=85",
    tags: ["Vaccines", "Immunization", "Clinical Records", "Preventive"],
    intro:
      "Vaccines have saved millions of companion animals from fatal infectious diseases such as rabies, parvovirus, panleukopenia, and distemper. Maintaining structured records guarantees your pet remains protected without redundant revaccination.",
    quickTakeaways: [
      "Core vaccines (Rabies, DHPP, FVRCP) protect against lethal, widespread pathogens.",
      "Non-core vaccines (Bordetella, Leptospirosis, Lyme) depend on regional lifestyle.",
      "Boarding, daycare, and international travel require strict vaccination compliance.",
      "Digital records eliminate frantic calls to clinics when emergency proof is needed.",
    ],
    pawlioTip:
      "Set automated reminder alerts 30 days before booster expiration. Some boarding facilities require boosters administered at least two weeks before check-in.",
    sections: [
      {
        heading: "Distinguishing Core from Lifestyle Immunizations",
        content: [
          "Core vaccines are medically recommended for every companion animal regardless of lifestyle due to the severity and communicability of the illnesses.",
          "Lifestyle vaccines are tailored by your veterinarian based on your geographic region and pet habits: dogs who frequent dog parks need Bordetella protection, while pets in wooded or wet areas benefit from Leptospirosis and Lyme boosters.",
        ],
      },
      {
        heading: "Boarding & Travel Documentation",
        content: [
          "Most kennels, daycare centers, and airlines will immediately turn away pets with missing or expired rabies and kennel cough records. A digital dashboard that displays expiration dates and clinic stamps saves hours of frustration.",
        ],
      },
    ],
  },
  {
    id: "blog-05",
    slug: "understanding-common-pet-behavior-signals",
    title: "Understanding Common Pet Behavior Signals and Body Language",
    category: "Behavior",
    isFeatured: false,
    excerpt:
      "Decode subtle communication signals in dogs and cats, from relaxed ear postures and tail carriage to early signs of environmental stress.",
    readingTime: "6 min read",
    publishedAt: "September 15, 2026",
    author: "PAWLIO Behavior Counsel",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1000&q=85",
    tags: ["Behavior", "Training", "Body Language", "Canine Communication"],
    intro:
      "Pets communicate continuously, but because their primary language is postural and visual rather than vocal, subtle signals of comfort or anxiety are easily misunderstood. Learning to read your pet's micro-cues strengthens your bond and prevents stress.",
    quickTakeaways: [
      "A wagging tail indicates emotional arousal, not necessarily happiness or friendliness.",
      "Yawning, lip licking, and whale eye (showing white of eyes) are early stress signals.",
      "Feline tail twitching and flattened ears indicate overstimulation and need for space.",
      "Respecting subtle boundary signals builds lasting trust and avoids defensive reactions.",
    ],
    pawlioTip:
      "When introducing a pet to new visitors, avoid leaning directly over them or offering direct eye contact. Let the animal initiate contact at their own pace.",
    sections: [
      {
        heading: "Deconstructing Canine Body Language",
        content: [
          "A truly relaxed dog displays soft eyes, a loosely swaying tail held at mid-spine level, and balanced weight distribution on all four paws.",
          "When dogs experience anxiety, they often exhibit 'displacement behaviors' such as excessive yawning when not tired, quick lip-flicks, or turning their head away. Recognizing these early tells allows you to remove them from overwhelming situations before distress escalates.",
        ],
      },
      {
        heading: "Feline Nuance: The Subtle Language of Cats",
        content: [
          "Cats express emotional states through whisker orientation, pupil dilation, and tail motion. A tail held high with a slight question-mark hook indicates confident greeting.",
          "A rapidly lashing tail tip combined with skin rippling along the spine signals sensory overload—a clear cue to pause petting before an overstimulation nip occurs.",
        ],
      },
    ],
  },
  {
    id: "blog-06",
    slug: "building-simple-daily-care-routine",
    title: "Building a Simple Daily Care Routine for Your Pet",
    category: "Daily Care",
    isFeatured: false,
    excerpt:
      "How a predictable daily rhythm of feeding, interactive play, dental hygiene, and restful downtime creates security and reduces behavioral anxiety.",
    readingTime: "4 min read",
    publishedAt: "September 11, 2026",
    author: "PAWLIO Wellness Team",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=85",
    tags: ["Daily Routine", "Enrichment", "Dental Care", "Habits"],
    intro:
      "Animals are creatures of habit. Predictable daily rhythms reduce cortisol levels, curb destructive separation behaviors, and streamline your household's pet management workflow.",
    quickTakeaways: [
      "Anchor meals and walks to consistent morning and evening time blocks.",
      "Include 2 minutes of daily pet dental brushing to prevent periodontal disease.",
      "Provide designated quiet zones where pets can rest undisturbed by household traffic.",
      "Rotate toys weekly so that play sessions remain novel and engaging.",
    ],
    pawlioTip:
      "Daily dental brushing with enzymatic pet toothpaste adds years to your companion's life by preventing oral bacteria from entering the bloodstream.",
    sections: [
      {
        heading: "The Power of Predictable Anchors",
        content: [
          "Pets do not read clocks, but they synchronize their internal circadian rhythm to household cues. Feeding, exercising, and resting around the same windows minimizes anticipatory anxiety and excessive vocalization.",
          "Balance active stimulus with enforced rest. Adult dogs need 12 to 14 hours of sleep daily, while cats often sleep 15 to 18 hours. Ensuring they have a dedicated, calm resting area is essential for emotional balance.",
        ],
      },
      {
        heading: "Incorporating Daily Dental Care",
        content: [
          "Over 80% of dogs and cats show signs of active periodontal disease by age three. Daily brushing with enzymatic, poultry- or beef-flavored pet toothpaste takes less than two minutes and prevents painful tooth extractions down the road.",
        ],
      },
    ],
  },
  {
    id: "blog-07",
    slug: "essential-care-tips-new-puppy-kitten",
    title: "Essential Care Tips for a New Puppy or Kitten",
    category: "Puppy & Kitten",
    isFeatured: false,
    excerpt:
      "Welcoming a young companion: early socialization timelines, home puppy-proofing, initial veterinary visits, and positive reinforcement basics.",
    readingTime: "7 min read",
    publishedAt: "September 5, 2026",
    author: "PAWLIO Pediatric Vet Staff",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=85",
    tags: ["Puppy Care", "Kitten Care", "Socialization", "Training"],
    intro:
      "Bringing home a puppy or kitten is one of life's most joyful milestones, yet the first weeks require thoughtful preparation. Establishing safe boundaries and proactive pediatric veterinary care sets the foundation for a lifetime of health.",
    quickTakeaways: [
      "Schedule an initial pediatric wellness check within 48 to 72 hours of arrival.",
      "The critical socialization window closes around 14 to 16 weeks of age.",
      "Puppy-proof your space by securing electrical cords, medications, and small objects.",
      "Rely entirely on positive reinforcement; punishment fosters fear and confusion.",
    ],
    pawlioTip:
      "Socialization does not mean greeting dozens of strange dogs. It means exposing your puppy calmly to diverse sounds, surfaces, sights, and people without fear.",
    sections: [
      {
        heading: "The Crucial Socialization Window",
        content: [
          "Between 3 and 14 weeks of age, young animals form their lifelong perceptions of what is safe and what is threatening. Introduce gentle exposure to car rides, umbrella openings, vacuum sounds at a distance, and diverse surfaces like tile, grass, and gravel.",
          "Keep all experiences positive with high-value treats and gentle praise. Never force a timid youngster toward something that frightens them.",
        ],
      },
      {
        heading: "Pediatric Veterinary Schedule & Deworming",
        content: [
          "Puppies and kittens require booster shots every 3 to 4 weeks until approximately 16 weeks old. They also require fecal parasite screenings and routine deworming. Keep young pets away from dog parks and public lawns until 2 weeks after their final core boosters.",
        ],
      },
    ],
  },
  {
    id: "blog-08",
    slug: "helping-senior-pet-stay-comfortable",
    title: "Helping Your Senior Pet Stay Comfortable, Mobile, and Happy",
    category: "Senior Care",
    isFeatured: false,
    excerpt:
      "Supporting aging dogs and cats with joint-friendly exercise, modified home environments, cognitive enrichment, and proactive senior checkups.",
    readingTime: "5 min read",
    publishedAt: "August 30, 2026",
    author: "PAWLIO Senior Care Specialists",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=85",
    tags: ["Senior Pets", "Mobility", "Joint Care", "Comfort"],
    intro:
      "Pets enter their golden years gracefully with the right supportive adaptations. While aging is natural, chronic pain and cognitive decline are manageable with attentive environmental tweaks and regular veterinary partnership.",
    quickTakeaways: [
      "Switch to bi-annual veterinary wellness exams once your pet turns 7 or 8.",
      "Place non-skid rugs along slick hardwood corridors to prevent painful slips.",
      "Provide orthopedic memory foam bedding that supports arthritic joints.",
      "Monitor water consumption and weight changes closely for endocrine cues.",
    ],
    pawlioTip:
      "Slowing down is not 'just old age'—it is frequently manageable osteoarthritis pain. Talk to your vet about modern pain relief, joint supplements, and physical therapy.",
    sections: [
      {
        heading: "Environmental Modifications for Arthritic Pets",
        content: [
          "Slick floors are dangerous for pets with reduced muscle mass. Adding runner rugs with rubber backings creates confident traction across your home.",
          "Incorporate pet ramps or shallow foam steps to help senior dogs reach cars or cats reach favorite resting perches without high-impact jumping.",
        ],
      },
      {
        heading: "Adjusting Activity & Cognitive Support",
        content: [
          "Replace single long, strenuous hikes with multiple short, gentle sniff walks. Keep mental engagement vibrant with snuffle mats and gentle food puzzles that stimulate the brain without straining aging limbs.",
        ],
      },
    ],
  },
];

/**
 * Retrieve article by URL slug
 */
export function getBlogPostBySlug(slug) {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return BLOG_POSTS.find((p) => p.slug.toLowerCase() === normalized) || null;
}

/**
 * Retrieve related articles (same category, excluding current)
 */
export function getRelatedPosts(currentSlug, category, limit = 3) {
  const others = BLOG_POSTS.filter((p) => p.slug !== currentSlug);
  const sameCategory = others.filter((p) => p.category === category);
  const differentCategory = others.filter((p) => p.category !== category);

  const combined = [...sameCategory, ...differentCategory];
  return combined.slice(0, limit);
}
