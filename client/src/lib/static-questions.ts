interface Question {
  question: string;
  answer: string;
}

interface GenerateQuestionsParams {
  subject: string;
  classLevel: string;
  difficulty: string;
  count: number;
}

const questionBank = {
  mathematics: {
    hard: [
      {
        question: "Explain the relationship between complex numbers and vector rotations in 2D space.",
        answer: "Complex numbers can represent 2D rotations where multiplication by a complex number z = a + bi corresponds to scaling by |z| and rotating by arg(z). This connects algebra with geometric transformations."
      },
      {
        question: "How does the concept of a limit relate to the derivative in calculus?",
        answer: "The derivative is defined as the limit of the difference quotient as h approaches 0: f'(x) = lim(h→0)[(f(x+h)-f(x))/h]. This implies continuity at points where the derivative exists."
      },
      {
        question: "Analyze the connection between eigenvalues and matrix diagonalization.",
        answer: "Eigenvalues (λ) and eigenvectors (v) satisfy Av = λv. A matrix is diagonalizable if it has n linearly independent eigenvectors. The diagonalization P⁻¹AP = D connects linear transformations with their canonical forms."
      },
      {
        question: "Explain how the Fundamental Theorem of Calculus bridges differential and integral calculus.",
        answer: "The theorem states that if F(x) is an antiderivative of f(x), then ∫[a to b]f(x)dx = F(b)-F(a). This shows integration and differentiation are inverse operations and connects local (derivative) with global (integral) properties."
      },
      {
        question: "How does the concept of a group in abstract algebra generalize symmetry?",
        answer: "Groups formalize symmetry through their axioms: closure, associativity, identity, and inverses. Every symmetry operation can be represented as a group element, and composition of symmetries corresponds to group multiplication."
      },
      {
        question: "Analyze the relationship between the Riemann Hypothesis and prime number distribution.",
        answer: "The Riemann Hypothesis suggests all non-trivial zeros of the zeta function have real part 1/2, which would imply optimal error bounds for the prime number theorem and deep connections between prime distribution and complex analysis."
      },
      {
        question: "How does topology relate to continuity and homeomorphisms?",
        answer: "Topology studies properties preserved under continuous deformation. Homeomorphisms are continuous bijections with continuous inverses, formalizing the idea of topological equivalence and preserving properties like connectedness and compactness."
      },
      {
        question: "Explain the significance of Gödel's Incompleteness Theorems in mathematical logic.",
        answer: "Gödel showed that in any consistent formal system capable of basic arithmetic, there exist true statements that cannot be proved within the system. This demonstrates fundamental limitations of formal mathematical systems and axiomatic reasoning."
      },
      {
        question: "How does measure theory extend the concept of integration beyond the Riemann integral?",
        answer: "Measure theory provides a general framework for integration, allowing integration over more general sets and functions. The Lebesgue integral, based on measure theory, overcomes limitations of the Riemann integral and connects with probability theory."
      },
      {
        question: "Analyze the connection between differential geometry and Einstein's theory of general relativity.",
        answer: "Differential geometry provides the mathematical framework for general relativity through concepts like manifolds, tensors, and curvature. The Einstein field equations describe gravity as geometric curvature of spacetime."
      },
      {
        question: "Explain the concept of a Hilbert space and its role in quantum mechanics.",
        answer: "A Hilbert space is a complete inner product space that serves as the mathematical foundation for quantum mechanics. It allows for the representation of quantum states as vectors and observables as operators."
      },
      {
        question: "How do Fourier transforms relate to signal processing and data analysis?",
        answer: "Fourier transforms decompose functions into sums of sinusoidal components, enabling analysis of signals in the frequency domain. This is crucial for filtering, compression, and understanding periodic phenomena."
      },
      {
        question: "Describe the connection between Galois theory and polynomial solvability.",
        answer: "Galois theory links field extensions to group theory, showing why some polynomials have no algebraic solution. The solvability of a polynomial equation is related to the structure of its Galois group."
      },
      {
        question: "Explain the role of category theory in unifying different areas of mathematics.",
        answer: "Category theory provides a unified language for mathematics, abstracting common patterns across different fields. It reveals deep connections between seemingly unrelated areas through functors and natural transformations."
      },
      {
        question: "How does the theory of distributions extend classical calculus?",
        answer: "Distribution theory generalizes functions to include singular objects like the Dirac delta. This enables rigorous treatment of derivatives of non-differentiable functions and is essential in physics and engineering."
      }
    ],
    medium: [
      {
        question: "What is the quadratic formula and when is it used?",
        answer: "The quadratic formula x = (-b ± √(b² - 4ac)) / 2a is used to solve quadratic equations in the form ax² + bx + c = 0. It gives all real or complex roots of the quadratic equation."
      },
      {
        question: "Explain the concept of a function's derivative.",
        answer: "A derivative measures the rate of change of a function at any given point. It represents the slope of the tangent line to the function's graph at that point and helps understand how the function is changing."
      },
      {
        question: "What is the relationship between sine and cosine?",
        answer: "Sine and cosine are trigonometric functions with a phase difference of π/2 radians (90°). They are related by the Pythagorean identity sin²(θ) + cos²(θ) = 1, and cos(θ) = sin(θ + π/2)."
      },
      {
        question: "How do you solve a system of linear equations using matrices?",
        answer: "Systems of linear equations can be solved using matrix operations like Gaussian elimination or matrix inverse. The solution exists if the coefficient matrix is invertible (determinant ≠ 0)."
      },
      {
        question: "What is the binomial theorem and how is it used?",
        answer: "The binomial theorem expands powers of binomials: (x + y)ⁿ = Σ(k=0 to n) (n choose k)xᵏyⁿ⁻ᵏ. It's used in probability, algebra, and combinatorics."
      },
      {
        question: "Explain the concept of mathematical induction.",
        answer: "Mathematical induction proves statements for all natural numbers by showing: 1) Base case is true, 2) If true for k, then true for k+1. This proves the statement for all n ≥ base case."
      },
      {
        question: "What is a logarithm and how does it relate to exponents?",
        answer: "A logarithm is the inverse of exponentiation. If bˣ = y, then logb(y) = x. Logarithms convert multiplication to addition and are useful in many applications."
      },
      {
        question: "How do you find the area under a curve?",
        answer: "The area under a curve is found using definite integration: ∫[a to b]f(x)dx. This can be calculated using antiderivatives or numerical methods."
      },
      {
        question: "What is a complex number and what are its components?",
        answer: "A complex number has the form a + bi, where a is the real part, b is the imaginary part, and i is the square root of -1. They extend real numbers and are essential in many areas of mathematics."
      },
      {
        question: "Explain the concept of a vector and its properties.",
        answer: "A vector is a quantity with both magnitude and direction. Vectors can be added, scaled, and have properties like dot product and cross product. They're used in physics and geometry."
      },
      {
        question: "What is probability and how is it calculated?",
        answer: "Probability measures the likelihood of events occurring. It's calculated as (favorable outcomes)/(total possible outcomes) for equally likely events. Basic rules include addition and multiplication rules."
      },
      {
        question: "How do you find the volume of a solid of revolution?",
        answer: "The volume of a solid of revolution is found using the washer or shell method. It involves integrating the area of cross-sections perpendicular to the axis of rotation."
      },
      {
        question: "What is a sequence and what is a series?",
        answer: "A sequence is an ordered list of numbers. A series is the sum of a sequence. Sequences can be arithmetic, geometric, or neither, and series can be finite or infinite."
      },
      {
        question: "Explain the concept of a function and its domain.",
        answer: "A function is a rule that assigns each input exactly one output. The domain is the set of all possible inputs. Functions can be linear, quadratic, exponential, etc."
      },
      {
        question: "What is correlation and how is it measured?",
        answer: "Correlation measures the strength and direction of relationship between variables. It's measured by correlation coefficient r, ranging from -1 to 1. Perfect correlation is ±1, no correlation is 0."
      }
    ],
    easy: [
      {
        question: "What is the Pythagorean theorem?",
        answer: "The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the length of the hypotenuse and a and b are the lengths of the other two sides."
      },
      {
        question: "How do you find the area of a rectangle?",
        answer: "The area of a rectangle is found by multiplying its length by its width: Area = length × width."
      },
      {
        question: "What is the order of operations in mathematics?",
        answer: "The order of operations is PEMDAS: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right)."
      },
      {
        question: "What is a fraction and how do you add fractions?",
        answer: "A fraction represents parts of a whole. To add fractions, find a common denominator, add the numerators, and simplify if possible."
      },
      {
        question: "How do you solve a linear equation?",
        answer: "To solve a linear equation: 1) Combine like terms, 2) Move variables to one side and numbers to the other, 3) Divide both sides by the coefficient of the variable."
      },
      {
        question: "What is the difference between mean, median, and mode?",
        answer: "Mean is the average (sum divided by count), median is the middle value when ordered, and mode is the most frequent value."
      },
      {
        question: "How do you calculate the perimeter of a shape?",
        answer: "The perimeter is the sum of all sides of a shape. For a rectangle: P = 2(length + width). For a triangle: P = a + b + c."
      },
      {
        question: "What are parallel and perpendicular lines?",
        answer: "Parallel lines never intersect and maintain the same distance apart. Perpendicular lines intersect at 90-degree angles."
      },
      {
        question: "How do you multiply decimals?",
        answer: "Multiply decimals as if they were whole numbers, then count decimal places in both factors and place the decimal point that many places from the right in the product."
      },
      {
        question: "What is a prime number?",
        answer: "A prime number is a natural number greater than 1 that has exactly two factors: 1 and itself. Examples: 2, 3, 5, 7, 11."
      },
      {
        question: "How do you find the slope of a line?",
        answer: "Slope = (y₂ - y₁)/(x₂ - x₁) for any two points (x₁,y₁) and (x₂,y₂) on the line. It measures the steepness and direction of the line."
      },
      {
        question: "What is an angle and how is it measured?",
        answer: "An angle is formed by two rays sharing an endpoint. It's measured in degrees (360° in a circle) or radians (2π in a circle)."
      },
      {
        question: "How do you convert between fractions, decimals, and percentages?",
        answer: "Decimal to percent: multiply by 100. Fraction to decimal: divide numerator by denominator. Percent to decimal: divide by 100."
      },
      {
        question: "What is the difference between factors and multiples?",
        answer: "Factors are numbers that divide evenly into another number. Multiples are products of a number and whole numbers."
      },
      {
        question: "How do you solve a proportion?",
        answer: "A proportion is an equation stating two ratios are equal. Cross multiply and solve: if a/b = c/d, then ad = bc."
      }
    ]
  },
  science: {
    hard: [
      {
        question: "Explain quantum entanglement and its implications for quantum computing.",
        answer: "Quantum entanglement occurs when particles become correlated in such a way that the quantum state of each particle cannot be described independently. This property is fundamental to quantum computing as it allows for quantum bits to exist in multiple states simultaneously."
      },
      {
        question: "How does the electron transport chain contribute to ATP synthesis?",
        answer: "The electron transport chain creates a proton gradient across the inner mitochondrial membrane through a series of redox reactions. This gradient drives ATP synthesis through chemiosmosis and ATP synthase."
      },
      {
        question: "Describe the relationship between entropy and the second law of thermodynamics.",
        answer: "The second law of thermodynamics states that the total entropy of an isolated system always increases over time. This means that systems tend toward maximum entropy, leading to the irreversibility of many natural processes."
      },
      {
        question: "Explain the role of dark matter in galaxy formation.",
        answer: "Dark matter provides the gravitational framework for galaxy formation and explains galaxy rotation curves. It makes up about 85% of the universe's mass but doesn't interact with electromagnetic radiation."
      },
      {
        question: "How do epigenetic modifications affect gene expression?",
        answer: "Epigenetic modifications like DNA methylation and histone modification can alter gene expression without changing the DNA sequence. These changes can be inherited and affected by environmental factors."
      },
      {
        question: "Describe the quantum tunneling effect and its applications.",
        answer: "Quantum tunneling allows particles to pass through potential barriers they classically couldn't overcome. This phenomenon is crucial in nuclear fusion, scanning tunneling microscopes, and quantum computers."
      },
      {
        question: "Explain the role of neurotransmitters in synaptic plasticity.",
        answer: "Neurotransmitters mediate changes in synaptic strength through mechanisms like long-term potentiation and depression. This plasticity is fundamental to learning and memory formation."
      },
      {
        question: "How does general relativity explain gravitational lensing?",
        answer: "General relativity predicts that massive objects curve spacetime, causing light to follow curved paths. This creates gravitational lensing effects used to study distant galaxies and dark matter distribution."
      },
      {
        question: "Describe the mechanism of CRISPR-Cas9 gene editing.",
        answer: "CRISPR-Cas9 uses guide RNA to target specific DNA sequences and Cas9 enzyme to cut DNA at precise locations. This allows for gene insertion, deletion, or modification with high precision."
      },
      {
        question: "Explain the concept of quantum superposition in quantum mechanics.",
        answer: "Quantum superposition allows particles to exist in multiple states simultaneously until measured. This principle underlies quantum computing and phenomena like wave-particle duality."
      },
      {
        question: "How do black holes affect spacetime and matter?",
        answer: "Black holes are regions where gravity is so strong that nothing, not even light, can escape. They distort spacetime severely and can cause time dilation effects predicted by general relativity."
      },
      {
        question: "Describe the role of telomeres in aging and cancer.",
        answer: "Telomeres protect chromosome ends and shorten with each cell division. Their degradation is linked to aging, while cancer cells often activate telomerase to maintain telomere length."
      },
      {
        question: "Explain the concept of quantum field theory.",
        answer: "Quantum field theory combines quantum mechanics with special relativity, describing particles as excitations in underlying fields. It explains particle interactions and is fundamental to modern physics."
      },
      {
        question: "How does the immune system distinguish self from non-self?",
        answer: "The immune system uses MHC molecules and T-cell selection to recognize self-antigens. This process involves both central and peripheral tolerance mechanisms."
      },
      {
        question: "Describe the role of dark energy in cosmic expansion.",
        answer: "Dark energy is a hypothetical form of energy causing the universe's accelerating expansion. It opposes gravity and makes up about 68% of the universe's energy content."
      }
    ],
    medium: [
      {
        question: "What is the difference between mitosis and meiosis?",
        answer: "Mitosis produces two identical daughter cells for growth and repair, while meiosis produces four genetically different cells for reproduction. Meiosis involves two divisions and genetic recombination."
      },
      {
        question: "Explain Newton's laws of motion.",
        answer: "Newton's laws are: 1) An object at rest stays at rest unless acted upon by a force, 2) Force equals mass times acceleration (F=ma), 3) For every action, there is an equal and opposite reaction."
      },
      {
        question: "What is the structure of DNA?",
        answer: "DNA is a double helix structure made of nucleotides. Each nucleotide contains a sugar, phosphate group, and one of four bases (A, T, C, G). A pairs with T, and C pairs with G through hydrogen bonds."
      },
      {
        question: "How does the greenhouse effect work?",
        answer: "The greenhouse effect occurs when gases in the atmosphere trap heat from the sun. These gases allow sunlight to pass through but absorb reflected infrared radiation, warming the Earth."
      },
      {
        question: "Explain the process of cellular respiration.",
        answer: "Cellular respiration breaks down glucose to produce ATP through glycolysis, the citric acid cycle, and the electron transport chain. It requires oxygen and produces CO2 and water."
      },
      {
        question: "What is the difference between acids and bases?",
        answer: "Acids donate hydrogen ions (H+) and have pH < 7, while bases accept H+ ions or donate OH- ions and have pH > 7. They react together in neutralization reactions."
      },
      {
        question: "How do vaccines work?",
        answer: "Vaccines contain weakened or dead pathogens or their parts to stimulate immune response. This creates memory cells that can quickly respond to future infections."
      },
      {
        question: "Explain the water cycle.",
        answer: "The water cycle involves evaporation from water bodies, condensation in clouds, precipitation as rain or snow, and collection in water bodies or groundwater. It's driven by solar energy."
      },
      {
        question: "What is the difference between chemical and physical changes?",
        answer: "Chemical changes create new substances through chemical reactions, while physical changes only alter the form or appearance without changing the substance's identity."
      },
      {
        question: "How do earthquakes occur?",
        answer: "Earthquakes occur when tectonic plates move and release stored energy. This creates seismic waves that travel through Earth, causing ground shaking and other effects."
      },
      {
        question: "Explain how sound waves travel.",
        answer: "Sound waves are mechanical waves that travel through matter by compression and rarefaction. They require a medium and their speed depends on the medium's properties."
      },
      {
        question: "What is the role of enzymes in biological reactions?",
        answer: "Enzymes are biological catalysts that speed up reactions by lowering activation energy. They are specific to particular substrates and affected by temperature and pH."
      },
      {
        question: "How does the nervous system transmit signals?",
        answer: "The nervous system transmits signals through neurons using electrical impulses (action potentials) and chemical neurotransmitters at synapses."
      },
      {
        question: "What is the difference between renewable and non-renewable resources?",
        answer: "Renewable resources can be replenished naturally in a human timescale (solar, wind), while non-renewable resources are finite and take millions of years to form (fossil fuels)."
      },
      {
        question: "Explain how plants respond to light.",
        answer: "Plants respond to light through phototropism, using photoreceptors to detect light direction. This guides growth and development through hormone regulation."
      }
    ],
    easy: [
      {
        question: "What are the three states of matter?",
        answer: "The three main states of matter are solid, liquid, and gas. Each state has different properties based on the arrangement and movement of particles."
      },
      {
        question: "What is photosynthesis?",
        answer: "Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It occurs in the chloroplasts of plant cells."
      },
      {
        question: "What is gravity?",
        answer: "Gravity is a force that attracts objects toward each other. On Earth, it pulls objects toward the center of the planet, giving them weight."
      },
      {
        question: "What are the main parts of a plant?",
        answer: "The main parts of a plant are roots (absorb water and nutrients), stem (supports and transports), leaves (photosynthesis), and flowers (reproduction)."
      },
      {
        question: "How does the digestive system work?",
        answer: "The digestive system breaks down food into nutrients through mechanical and chemical processes. It includes organs from mouth to intestines."
      },
      {
        question: "What causes seasons?",
        answer: "Seasons are caused by Earth's tilted axis as it orbits the Sun. This changes the amount of direct sunlight different parts of Earth receive throughout the year."
      },
      {
        question: "What is the difference between weather and climate?",
        answer: "Weather is the day-to-day condition of the atmosphere, while climate is the average weather pattern in an area over many years."
      },
      {
        question: "How do magnets work?",
        answer: "Magnets have north and south poles that attract or repel each other. They create magnetic fields that can affect certain materials, especially other magnets and iron."
      },
      {
        question: "What are the basic needs of living things?",
        answer: "Living things need water, food, air, shelter, and suitable temperature to survive. They also need to be able to reproduce and respond to their environment."
      },
      {
        question: "What is the solar system?",
        answer: "The solar system consists of the Sun and objects that orbit it, including planets, dwarf planets, asteroids, and comets."
      },
      {
        question: "How does electricity flow in a circuit?",
        answer: "Electricity flows in a complete circuit from the power source through conductors and components and back to the source. It needs an unbroken path."
      },
      {
        question: "What is the food chain?",
        answer: "A food chain shows how energy moves from one organism to another in an ecosystem, starting with producers (plants) and moving through consumers."
      },
      {
        question: "What are the main types of simple machines?",
        answer: "The main simple machines are lever, wheel and axle, pulley, inclined plane, wedge, and screw. They make work easier by changing the direction or size of forces."
      },
      {
        question: "How do clouds form?",
        answer: "Clouds form when water vapor in the air cools and condenses around tiny particles. Different types of clouds form at different altitudes and conditions."
      },
      {
        question: "What is the difference between vertebrates and invertebrates?",
        answer: "Vertebrates have a backbone (spine), while invertebrates do not. Examples of vertebrates include mammals, birds, and fish; invertebrates include insects and worms."
      }
    ]
  },
  history: {
    hard: [
      {
        question: "Analyze the long-term impacts of the Industrial Revolution on modern society.",
        answer: "The Industrial Revolution transformed society through urbanization, technological advancement, labor reforms, and economic systems. It led to modern capitalism, environmental challenges, and social class restructuring."
      },
      {
        question: "Compare and contrast the causes of World War I and World War II.",
        answer: "WWI was triggered by nationalism, militarism, and alliance systems, while WWII arose from failed peace treaties, economic depression, and aggressive totalitarian regimes. Both wars reshaped global power structures."
      },
      {
        question: "Evaluate the significance of the Cold War in shaping modern international relations.",
        answer: "The Cold War established a bipolar world order, led to proxy wars, arms race, and ideological divisions. Its legacy continues in current international politics, alliances, and nuclear diplomacy."
      },
      {
        question: "Analyze the impact of the Renaissance on European art, science, and philosophy.",
        answer: "The Renaissance revolutionized art through perspective and realism, advanced scientific inquiry, and promoted humanism. It marked the transition from medieval to modern thinking."
      },
      {
        question: "Discuss the role of colonialism in shaping modern global economics and politics.",
        answer: "Colonialism created lasting economic dependencies, cultural conflicts, and political boundaries. It influenced modern international trade, migration patterns, and development disparities."
      }
    ],
    medium: [
      {
        question: "What were the main causes of the American Revolution?",
        answer: "The American Revolution was caused by taxation without representation, British colonial policies, growing American identity, and desires for self-governance."
      },
      {
        question: "Explain the significance of the French Revolution.",
        answer: "The French Revolution overthrew monarchy, established citizenship rights, and spread ideas of liberty, equality, and fraternity across Europe."
      },
      {
        question: "What was the impact of the Civil Rights Movement in America?",
        answer: "The Civil Rights Movement led to desegregation, voting rights, anti-discrimination laws, and increased social awareness of racial inequality."
      }
    ],
    easy: [
      {
        question: "Who was the first President of the United States?",
        answer: "George Washington was the first President, serving from 1789 to 1797. He established many important precedents for American leadership."
      },
      {
        question: "What was the Declaration of Independence?",
        answer: "The Declaration of Independence was a document adopted in 1776 that announced the American colonies' separation from British rule."
      }
    ]
  },
  literature: {
    hard: [
      {
        question: "Analyze the themes of identity and alienation in modern literature.",
        answer: "Modern literature explores identity through psychological complexity, social isolation, and cultural displacement, reflecting broader societal changes and individual struggles."
      },
      {
        question: "Compare the different literary movements of the 20th century.",
        answer: "20th century literature included modernism, postmodernism, magical realism, and beat generation, each reflecting different social and philosophical perspectives."
      }
    ],
    medium: [
      {
        question: "What are the main elements of Shakespearean tragedy?",
        answer: "Shakespearean tragedies feature a tragic hero with a fatal flaw, supernatural elements, internal and external conflicts, and themes of fate versus free will."
      }
    ],
    easy: [
      {
        question: "What is the difference between poetry and prose?",
        answer: "Poetry uses structured language, rhythm, and often rhyme to express ideas and emotions, while prose uses ordinary written language in sentences and paragraphs."
      }
    ]
  },
  geography: {
    hard: [
      {
        question: "Explain the impact of climate change on global weather patterns.",
        answer: "Climate change affects precipitation patterns, ocean currents, extreme weather events, and ecosystem distribution, leading to various environmental and social challenges."
      }
    ],
    medium: [
      {
        question: "What are the major tectonic plates and how do they interact?",
        answer: "Major tectonic plates include Pacific, North American, Eurasian, and African plates. They interact through convergent, divergent, and transform boundaries, causing earthquakes and volcanic activity."
      }
    ],
    easy: [
      {
        question: "What are the seven continents?",
        answer: "The seven continents are North America, South America, Europe, Asia, Africa, Australia, and Antarctica."
      }
    ]
  },
  computer_science: {
    hard: [
      {
        question: "Explain the concept of time complexity in algorithms.",
        answer: "Time complexity measures how algorithm runtime grows with input size, typically expressed in Big O notation. It helps evaluate algorithm efficiency and scalability."
      },
      {
        question: "What is the difference between HTTP and HTTPS?",
        answer: "HTTPS adds SSL/TLS encryption to HTTP, securing data transmission between client and server. It provides authentication, integrity, and confidentiality."
      }
    ],
    medium: [
      {
        question: "What is Object-Oriented Programming?",
        answer: "OOP is a programming paradigm based on objects containing data and code. It features encapsulation, inheritance, polymorphism, and abstraction."
      }
    ],
    easy: [
      {
        question: "What is a variable in programming?",
        answer: "A variable is a named storage location in computer memory that holds data which can be modified during program execution."
      }
    ]
  }
};

export function generateQuestions(params: GenerateQuestionsParams): Question[] {
  // Get questions for the specified subject and difficulty
  const subjectQuestions = questionBank[params.subject as keyof typeof questionBank] || questionBank.mathematics;
  const difficultyQuestions = subjectQuestions[params.difficulty as keyof typeof subjectQuestions] || subjectQuestions.medium;

  // If we don't have enough questions, cycle through them
  const result: Question[] = [];
  for (let i = 0; i < params.count; i++) {
    result.push(difficultyQuestions[i % difficultyQuestions.length]);
  }

  return result;
}

export function generatePdfQuestions(pdfId: string, count: number, difficulty: string = 'medium'): Question[] {
  // Get the PDF name from localStorage
  const pdfName = localStorage.getItem(pdfId) || 'Document';
  const topic = pdfName.replace('.pdf', '').replace(/[_-]/g, ' ');

  // Return generic questions about document analysis
  const questions = [
    {
      question: `What are the main concepts discussed in ${topic}?`,
      answer: "The main concepts would be found in the document's key sections and themes."
    },
    {
      question: `How does ${topic} relate to practical applications?`,
      answer: "The practical applications would be discussed in the document's examples and case studies."
    },
    {
      question: `What are the key findings or conclusions in ${topic}?`,
      answer: "The key findings would be summarized in the document's conclusion section."
    },
    {
      question: `What evidence supports the main arguments in ${topic}?`,
      answer: "Supporting evidence would be presented throughout the document in the form of data, examples, and citations."
    },
    {
      question: `How does ${topic} compare to related theories or concepts?`,
      answer: "Comparisons and contrasts with related ideas would be discussed in the literature review or analysis sections."
    },
    {
      question: `What are the limitations or challenges discussed in ${topic}?`,
      answer: "Limitations and challenges would typically be addressed in the discussion or conclusion sections."
    },
    {
      question: `What methodology is used to study ${topic}?`,
      answer: "The methodology would be detailed in the methods or approach section of the document."
    },
    {
      question: `What are the future implications of ${topic}?`,
      answer: "Future implications and recommendations would be discussed in the conclusion or future work sections."
    },
    {
      question: `How has ${topic} evolved over time?`,
      answer: "Historical context and development would be covered in the background or introduction sections."
    },
    {
      question: `What are the ethical considerations related to ${topic}?`,
      answer: "Ethical considerations would be addressed in the discussion or dedicated ethics sections."
    },
    {
      question: `How does ${topic} impact different stakeholders?`,
      answer: "Stakeholder impacts would be analyzed in the results or discussion sections."
    },
    {
      question: `What are the key terms and definitions in ${topic}?`,
      answer: "Key terms would be defined in the introduction or a dedicated terminology section."
    },
    {
      question: `What problems does ${topic} address?`,
      answer: "Problem statements would be outlined in the introduction or background sections."
    },
    {
      question: `How is success measured in ${topic}?`,
      answer: "Success metrics and evaluation criteria would be described in the methodology or results sections."
    },
    {
      question: `What are the alternative approaches to ${topic}?`,
      answer: "Alternative approaches would be compared in the literature review or discussion sections."
    }
  ];

  // Return the requested number of questions, cycling if necessary
  const result: Question[] = [];
  for (let i = 0; i < count; i++) {
    result.push(questions[i % questions.length]);
  }

  return result;
} 