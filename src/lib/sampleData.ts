import { LectureData } from '@/types';

export const sampleLectures: LectureData[] = [
  {
    id: 'cs-neural-networks',
    title: 'CS 182: Deep Learning & Neural Network Backpropagation',
    subject: 'Computer Science & AI',
    folder: 'Semester 1 Core',
    duration: '48 mins',
    date: '2026-10-01',
    summary: 'Comprehensive analysis of multi-layer perceptrons, forward propagation mathematics, loss functions, and backpropagation via the chain rule with gradient descent optimization.',
    markdownNotes: `# CS 182: Deep Learning & Neural Network Foundations

## 1. Executive Summary
Neural networks function as universal function approximators capable of learning non-linear mappings from input space $\\mathcal{X}$ to output space $\\mathcal{Y}$. This lecture covers forward signal propagation, activation functions, cost metrics, and mathematical derivation of backpropagation using the multivariate chain rule.

---

## 2. Forward Signal Propagation
Each neuron in layer $l$ computes an affine transformation followed by a non-linear activation:

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = \\sigma(z^{[l]})$$

Where:
* $W^{[l]} \\in \\mathbb{R}^{n_l \\times n_{l-1}}$ is the weight matrix for layer $l$.
* $b^{[l]} \\in \\mathbb{R}^{n_l}$ is the bias vector.
* $a^{[0]} = x$ represents the input feature vector.
* $\\sigma(\\cdot)$ represents the non-linear activation function.

### Key Activation Functions Comparison
| Function | Formula | Derivative $\\sigma'(z)$ | Range | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Sigmoid** | $\\frac{1}{1 + e^{-z}}$ | $\\sigma(z)(1 - \\sigma(z))$ | $(0, 1)$ | Vanishing gradient problem in deep layers |
| **ReLU** | $\\max(0, z)$ | $1$ if $z > 0$ else $0$ | $[0, \\infty)$ | Computationally fast; prevents gradient decay |
| **GELU** | $z \\cdot \\Phi(z)$ | Smooth non-linearity | $(-0.17, \\infty)$ | Default in modern Transformers |

---

## 3. Loss Functions & Objective Formulation
For binary classification, we minimize the binary cross-entropy (negative log-likelihood) loss:

$$\\mathcal{L}(y, \\hat{y}) = -\\left[ y \\log(\\hat{y}) + (1 - y) \\log(1 - \\hat{y}) \\right]$$

For multi-class classification with $K$ classes:

$$\\mathcal{L}_{CE} = - \\sum_{k=1}^K y_k \\log(\\hat{y}_k), \\quad \\text{where } \\hat{y}_k = \\frac{e^{z_k}}{\\sum_{j=1}^K e^{z_j}}$$

---

## 4. Backpropagation Derivation
Backpropagation utilizes reverse-mode automatic differentiation. The error signal for the output layer $L$ is:

$$\\delta^{[L]} = \\frac{\\partial \\mathcal{L}}{\\partial z^{[L]}} = a^{[L]} - y$$

For hidden layers $l = L-1, \\dots, 1$, the recurrence relation is:

$$\\delta^{[l]} = \\left( (W^{[l+1]})^T \\delta^{[l+1]} \\right) \\odot \\sigma'(z^{[l]})$$

Weight and bias gradient updates:

$$\\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}} = \\delta^{[l]} (a^{[l-1]})^T, \\quad \\frac{\\partial \\mathcal{L}}{\\partial b^{[l]}} = \\delta^{[l]}$$

---

## 5. Key Takeaways & Exam Tips
* Always normalize inputs to zero mean and unit variance ($z = \\frac{x - \\mu}{\\sigma}$) to prevent ill-conditioned Hessian loss landscapes.
* Use He initialization for ReLU activations: $W \\sim \\mathcal{N}\\left(0, \\sqrt{\\frac{2}{n_{in}}}\\right)$.
* Vanishing gradients occur when $|\\sigma'(z)| < 1$ repeatedly cascades through deep matrices.
`,
    mindmapMarkdown: `# Deep Learning & Neural Networks
## 1. Architecture
### Input Layer (x)
### Hidden Layers
#### Weights (W)
#### Biases (b)
#### Activations
##### ReLU (max(0, z))
##### Sigmoid (1 / (1 + e^-z))
##### GELU
### Output Layer
#### Softmax (Multi-class)
#### Sigmoid (Binary)
## 2. Forward Propagation
### Linear Transform: z = W*a + b
### Activation: a = sigma(z)
## 3. Loss Functions
### Cross-Entropy (Classification)
### MSE (Regression)
## 4. Backpropagation
### Chain Rule Error: delta = dL/dz
### Weight Gradient: dL/dW = delta * a^T
### Bias Gradient: dL/db = delta
### Optimizer: SGD / Adam
## 5. Optimization & Regularization
### He Initialization
### Batch Normalization
### Dropout
### Learning Rate Decay
`,
    flashcards: [
      {
        id: 'fc-1',
        front: 'What is the vanishing gradient problem and which activation function mitigates it?',
        back: 'The vanishing gradient problem occurs when backpropagated gradients shrink exponentially as they multiply through layers with derivatives < 1 (e.g. Sigmoid has max derivative 0.25). ReLU mitigates this because its derivative is exactly 1 for all positive inputs.',
        tag: 'Activations'
      },
      {
        id: 'fc-2',
        front: 'Write the recurrence relation for the error term delta in hidden layer l during backpropagation.',
        back: 'delta^[l] = ((W^[l+1])^T * delta^[l+1]) element-wise-multiplied with sigma\'(z^[l]).',
        tag: 'Mathematics'
      },
      {
        id: 'fc-3',
        front: 'Why is He (Kaiming) initialization preferred over Xavier for networks using ReLU activations?',
        back: 'ReLU zeroes out half the negative inputs on average (variance halved). He initialization compensates by using variance 2/n_in instead of 1/n_in, keeping signal variance stable across deep layers.',
        tag: 'Initialization'
      },
      {
        id: 'fc-4',
        front: 'What is the output gradient of Softmax combined with Cross-Entropy Loss?',
        back: 'dL/dz = p - y, which is simply the predicted probability distribution vector minus the one-hot target vector.',
        tag: 'Loss Functions'
      },
      {
        id: 'fc-5',
        front: 'What is the purpose of Batch Normalization during deep network training?',
        back: 'It normalizes layer inputs to zero mean and unit variance per mini-batch, reducing internal covariate shift, smoothing the optimization landscape, and enabling higher learning rates.',
        tag: 'Regularization'
      }
    ],
    quiz: [
      {
        id: 'qz-1',
        question: 'Which of the following activation functions has a maximum first derivative of 0.25, contributing heavily to vanishing gradients?',
        options: ['GELU', 'ReLU', 'Leaky ReLU', 'Sigmoid'],
        correctIndex: 3,
        explanation: 'The derivative of Sigmoid is sigma(z)*(1 - sigma(z)). At z=0, sigma(0)=0.5, giving 0.5 * 0.5 = 0.25, which is its maximum value.'
      },
      {
        id: 'qz-2',
        question: 'In standard backpropagation, what operation is performed between the incoming backpropagated error (W^T * delta) and the local activation derivative sigma\'(z)?',
        options: ['Matrix Multiplication', 'Hadamard (Element-wise) Product', 'Kronecker Product', 'Cross Product'],
        correctIndex: 1,
        explanation: 'The multivariate chain rule requires element-wise (Hadamard) multiplication between the mapped error vector and the local activation derivative.'
      },
      {
        id: 'qz-3',
        question: 'What is the recommended weight variance for He (Kaiming) normal initialization for a layer with n_in input neurons?',
        options: ['1 / n_in', '2 / n_in', '1 / (n_in + n_out)', '2 / (n_in + n_out)'],
        correctIndex: 1,
        explanation: 'He initialization sets Var(W) = 2 / n_in to account for the rectifying nature of ReLU which zeroes out approximately 50% of the activations.'
      },
      {
        id: 'qz-4',
        question: 'Why is Softmax paired with Cross-Entropy loss in multi-class classification?',
        options: [
          'It forces all weights to sum to 1',
          'Its combined gradient is remarkably simple: y_hat - y',
          'It guarantees zero training error on every step',
          'It completely eliminates the need for biases'
        ],
        correctIndex: 1,
        explanation: 'Combining Cross-Entropy with Softmax simplifies the derivative dramatically to (y_hat - y), providing strong, stable error signals during training.'
      }
    ]
  },
  {
    id: 'bio-cellular-respiration',
    title: 'BIO 101: Cellular Respiration & ATP Synthesis',
    subject: 'Biology & Biochemistry',
    folder: 'Midterm Prep',
    duration: '35 mins',
    date: '2026-09-28',
    summary: 'Exploration of Glycolysis, the Citric Acid Cycle, oxidative phosphorylation, and the chemiosmotic mechanism driven by ATP synthase across the mitochondrial inner membrane.',
    markdownNotes: `# BIO 101: Cellular Respiration & Energetics

## 1. Overview & Net Reaction
Cellular respiration is the catabolic pathway by which cells harvest chemical energy from glucose:

$$\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 30\\text{-}32\\text{ ATP}$$

The process occurs in 4 distinct stages:
1. **Glycolysis** (Cytoplasm)
2. **Pyruvate Oxidation** (Mitochondrial Matrix)
3. **Citric Acid (Krebs) Cycle** (Mitochondrial Matrix)
4. **Oxidative Phosphorylation** (Inner Mitochondrial Membrane)

---

## 2. ATP Yield Breakdown per Glucose Molecule
| Stage | Primary Substrates | Direct ATP | Reduced Coenzymes |
| :--- | :--- | :--- | :--- |
| **Glycolysis** | Glucose | 2 ATP (net) | 2 NADH |
| **Pyruvate Decarboxylation** | 2 Pyruvate | 0 ATP | 2 NADH |
| **Citric Acid Cycle** | 2 Acetyl-CoA | 2 GTP (ATP) | 6 NADH, 2 FADH$_2$ |
| **Oxidative Phosphorylation** | 10 NADH, 2 FADH$_2$ | ~26-28 ATP | H$_2$O byproduct |
`,
    mindmapMarkdown: `# Cellular Respiration
## 1. Glycolysis (Cytoplasm)
### Energy Investment (2 ATP used)
### Energy Payoff (4 ATP + 2 NADH)
### Net: 2 Pyruvate + 2 ATP + 2 NADH
## 2. Pyruvate Oxidation
### Entry to Matrix
### 2 Acetyl-CoA generated
### 2 CO2 released
## 3. Citric Acid Cycle (Matrix)
### Oxaloacetate + Acetyl-CoA -> Citrate
### Per glucose: 6 NADH, 2 FADH2, 2 GTP, 4 CO2
## 4. Oxidative Phosphorylation
### Electron Transport Chain (Complex I-IV)
### Proton Gradient (Intermembrane Space)
### Chemiosmosis via ATP Synthase
### Final Electron Acceptor: O2 -> H2O
`,
    flashcards: [
      {
        id: 'fc-bio-1',
        front: 'Where does glycolysis occur within an eukaryotic cell?',
        back: 'In the cytosol / cytoplasm (outside the mitochondria).',
        tag: 'Cellular Locations'
      },
      {
        id: 'fc-bio-2',
        front: 'What is the final electron acceptor in the mitochondrial electron transport chain?',
        back: 'Molecular Oxygen (O2), which is reduced to form water (H2O).',
        tag: 'Oxidative Phosphorylation'
      },
      {
        id: 'fc-bio-3',
        front: 'How many net ATP molecules are produced directly from Glycolysis per glucose molecule?',
        back: '2 net ATP (4 produced minus 2 consumed in the investment phase).',
        tag: 'Bioenergetics'
      }
    ],
    quiz: [
      {
        id: 'qz-bio-1',
        question: 'Which enzyme utilizes the proton motive force across the inner mitochondrial membrane to generate ATP from ADP and Pi?',
        options: ['Pyruvate kinase', 'ATP Synthase (Complex V)', 'Hexokinase', 'Phosphofructokinase'],
        correctIndex: 1,
        explanation: 'ATP Synthase (Complex V) couples the downhill flow of protons from the intermembrane space into the matrix with the synthesis of ATP.'
      }
    ]
  }
];

export const defaultFolders = [
  { id: 'fld-1', name: 'Semester 1 Core', color: '#6366f1', icon: 'Folder', createdAt: '2026-09-20' },
  { id: 'fld-2', name: 'Midterm Prep', color: '#f59e0b', icon: 'Folder', createdAt: '2026-09-25' },
  { id: 'fld-3', name: 'Research & Labs', color: '#10b981', icon: 'Folder', createdAt: '2026-09-30' },
];

export const sampleLecturesMalay: LectureData[] = [
  {
    id: 'cs-neural-networks',
    title: 'CS 182: Pembelajaran Mendalam & Perambatan Balik Rangkaian Neural',
    subject: 'Sains Komputer & AI',
    folder: 'Semester 1 Core',
    duration: '48 minit',
    date: '2026-10-01',
    summary: 'Analisis menyeluruh perseptron berbilang lapisan, matematik perambatan isyarat hadapan, fungsi kerugian, dan perambatan balik melalui petua rantai multivariate dengan pengoptimuman penurunan kecerunan.',
    markdownNotes: `# CS 182: Asas Pembelajaran Mendalam & Rangkaian Neural

## 1. Ringkasan Eksekutif
Rangkaian neural bertindak sebagai penghampir fungsi sejagat (universal function approximators) yang berupaya mempelajari pemetaan bukan linear daripada ruang input $\\mathcal{X}$ ke ruang output $\\mathcal{Y}$. Kuliah ini merangkumi perambatan isyarat hadapan, fungsi pengaktifan, metrik kos, dan terbitan matematik perambatan balik (backpropagation) menggunakan petua rantai multivariat.

---

## 2. Perambatan Isyarat Hadapan (Forward Propagation)
Setiap neuron dalam lapisan $l$ mengira transformasi afin yang diikuti oleh pengaktifan bukan linear:

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = \\sigma(z^{[l]})$$

Di mana:
* $W^{[l]} \\in \\mathbb{R}^{n_l \\times n_{l-1}}$ adalah matriks pemberat bagi lapisan $l$.
* $b^{[l]} \\in \\mathbb{R}^{n_l}$ adalah vektor pincang (bias).
* $a^{[0]} = x$ mewakili vektor ciri input.
* $\\sigma(\\cdot)$ mewakili fungsi pengaktifan bukan linear.

### Perbandingan Fungsi Pengaktifan Utama
| Fungsi | Formula | Terbitan $\\sigma'(z)$ | Julat | Nota Penting |
| :--- | :--- | :--- | :--- | :--- |
| **Sigmoid** | $\\frac{1}{1 + e^{-z}}$ | $\\sigma(z)(1 - \\sigma(z))$ | $(0, 1)$ | Masalah kecerunan lenyap pada lapisan dalam |
| **ReLU** | $\\max(0, z)$ | $1$ jika $z > 0$ sebaliknya $0$ | $[0, \\infty)$ | Sangat cekap; mencegah pereputan kecerunan |
| **GELU** | $z \\cdot \\Phi(z)$ | Bukan linear lancar | $(-0.17, \\infty)$ | Pilihan piawai dalam model Transformer moden |

---

## 3. Fungsi Kerugian & Formulasi Objektif
Bagi pengelasan binari, kita meminimumkan kerugian entropi silang binari:

$$\\mathcal{L}(y, \\hat{y}) = -\\left[ y \\log(\\hat{y}) + (1 - y) \\log(1 - \\hat{y}) \\right]$$

Bagi pengelasan berbilang kelas dengan $K$ kelas:

$$\\mathcal{L}_{CE} = - \\sum_{k=1}^K y_k \\log(\\hat{y}_k), \\quad \\text{di mana } \\hat{y}_k = \\frac{e^{z_k}}{\\sum_{j=1}^K e^{z_j}}$$

---

## 4. Terbitan Perambatan Balik (Backpropagation)
Perambatan balik menggunakan pembezaan automatik mod undur. Isyarat ralat bagi lapisan output $L$ ialah:

$$\\delta^{[L]} = \\frac{\\partial \\mathcal{L}}{\\partial z^{[L]}} = a^{[L]} - y$$

Bagi lapisan tersembunyi $l = L-1, \\dots, 1$, hubungan pengulangan adalah:

$$\\delta^{[l]} = \\left( (W^{[l+1]})^T \\delta^{[l+1]} \\right) \\odot \\sigma'(z^{[l]})$$

Kemas kini kecerunan pemberat dan pincang:

$$\\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}} = \\delta^{[l]} (a^{[l-1]})^T, \\quad \\frac{\\partial \\mathcal{L}}{\\partial b^{[l]}} = \\delta^{[l]}$$

---

## 5. Rumusan Penting & Tip Peperiksaan
* Sentiasa normalkan input kepada min sifar dan varians unit ($z = \\frac{x - \\mu}{\\sigma}$) untuk mengelakkan landskap kerugian Hessian yang bermasalah.
* Gunakan pemulaan He untuk pengaktifan ReLU: $W \\sim \\mathcal{N}\\left(0, \\sqrt{\\frac{2}{n_{in}}}\\right)$.
* Kecerunan lenyap berlaku apabila $|\\sigma'(z)| < 1$ mendarab berulang kali melalui matriks lapisan dalam.
`,
    mindmapMarkdown: `# Pembelajaran Mendalam & Rangkaian Neural
## 1. Seni Bina Rangkaian
### Lapisan Input (x)
### Lapisan Tersembunyi
#### Pemberat (W)
#### Pincang / Bias (b)
#### Fungsi Pengaktifan
##### ReLU (max(0, z))
##### Sigmoid (1 / (1 + e^-z))
##### GELU
### Lapisan Output
#### Softmax (Pelbagai Kelas)
#### Sigmoid (Binari)
## 2. Perambatan Hadapan
### Transformasi Linear: z = W*a + b
### Pengaktifan: a = sigma(z)
## 3. Fungsi Kerugian
### Entropi Silang (Pengelasan)
### MSE (Regresi)
## 4. Perambatan Balik
### Ralat Petua Rantai: delta = dL/dz
### Kecerunan Pemberat: dL/dW = delta * a^T
### Kecerunan Pincang: dL/db = delta
### Pengoptimum: SGD / Adam
## 5. Pengoptimuman & Regularisasi
### Pemulaan He (He Initialization)
### Normalisasi Kelompok (Batch Norm)
### Dropout
### Pereputan Kadar Pembelajaran
`,
    flashcards: [
      {
        id: 'fc-1',
        front: 'Apakah masalah kecerunan lenyap (vanishing gradient) dan fungsi pengaktifan manakah yang mengatasinya?',
        back: 'Kecerunan lenyap berlaku apabila kecerunan yang merambat balik menyusut secara eksponen kerana didarab melalui lapisan dengan terbitan < 1 (contohnya Sigmoid dengan terbitan maksimum 0.25). ReLU mengatasi masalah ini kerana terbitannya adalah tepat 1 untuk semua input positif.',
        tag: 'Pengaktifan'
      },
      {
        id: 'fc-2',
        front: 'Tuliskan formula pengulangan bagi sebutan ralat delta dalam lapisan tersembunyi l semasa perambatan balik.',
        back: 'delta^[l] = ((W^[l+1])^T * delta^[l+1]) didarabkan unsur demi unsur (Hadamard product) dengan sigma\'(z^[l]).',
        tag: 'Matematik'
      },
      {
        id: 'fc-3',
        front: 'Mengapakah pemulaan He (Kaiming) lebih disukai berbanding Xavier bagi rangkaian yang menggunakan pengaktifan ReLU?',
        back: 'ReLU menyifarkan purata separuh daripada input negatif (varians berkurangan separuh). Pemulaan He mengimbanginya dengan menggunakan varians 2/n_in berbanding 1/n_in, mengekalkan varians isyarat stabil merentasi lapisan dalam.',
        tag: 'Pemulaan'
      },
      {
        id: 'fc-4',
        front: 'Apakah kecerunan output bagi gabungan fungsi Softmax dan kerugian Entropi Silang?',
        back: 'dL/dz = p - y, iaitu perbezaan ringkas antara vektor taburan kebarangkalian yang diramal tolak vektor sasaran sebenar.',
        tag: 'Fungsi Kerugian'
      },
      {
        id: 'fc-5',
        front: 'Apakah tujuan Normalisasi Kelompok (Batch Normalization) semasa latihan rangkaian dalam?',
        back: 'Ia menormalkan input lapisan kepada min sifar dan varians unit bagi setiap kelompok kecil, mengurangkan anjakan kovariat dalaman, melicinkan landskap pengoptimuman, dan membolehkan kadar pembelajaran lebih tinggi.',
        tag: 'Regularisasi'
      }
    ],
    quiz: [
      {
        id: 'qz-1',
        question: 'Antara fungsi pengaktifan berikut, yang manakah mempunyai terbitan pertama maksimum 0.25 yang menyumbang kepada masalah kecerunan lenyap?',
        options: ['GELU', 'ReLU', 'Leaky ReLU', 'Sigmoid'],
        correctIndex: 3,
        explanation: 'Terbitan Sigmoid ialah sigma(z)*(1 - sigma(z)). Pada z=0, sigma(0)=0.5, menghasilkan 0.5 * 0.5 = 0.25, iaitu nilai maksimumnya.'
      },
      {
        id: 'qz-2',
        question: 'Dalam perambatan balik standard, apakah operasi yang dilakukan antara ralat yang dirambat balik (W^T * delta) dan terbitan pengaktifan tempatan sigma\'(z)?',
        options: ['Pendaraban Matriks', 'Hasil Darab Hadamard (Unsur demi Unsur)', 'Hasil Darab Kronecker', 'Hasil Darab Silang'],
        correctIndex: 1,
        explanation: 'Petua rantai multivariat memerlukan pendaraban unsur demi unsur (Hadamard) antara vektor ralat dan terbitan pengaktifan tempatan.'
      },
      {
        id: 'qz-3',
        question: 'Apakah varians pemberat yang disyorkan bagi pemulaan normal He (Kaiming) untuk lapisan dengan n_in neuron input?',
        options: ['1 / n_in', '2 / n_in', '1 / (n_in + n_out)', '2 / (n_in + n_out)'],
        correctIndex: 1,
        explanation: 'Pemulaan He menetapkan Var(W) = 2 / n_in bagi menampung sifat ReLU yang menyifarkan kira-kira 50% pengaktifan.'
      },
      {
        id: 'qz-4',
        question: 'Mengapakah Softmax digandingkan dengan kerugian Entropi Silang dalam pengelasan pelbagai kelas?',
        options: [
          'Ia memaksa semua pemberat berjumlah 1',
          'Kecerunan gabungannya amat ringkas: y_hat - y',
          'Ia menjamin sifar ralat latihan pada setiap langkah',
          'Ia menghapuskan sepenuhnya keperluan untuk pincang (bias)'
        ],
        correctIndex: 1,
        explanation: 'Menggabungkan Entropi Silang dengan Softmax memudahkan terbitan secara drastik kepada (y_hat - y), memberikan isyarat ralat yang stabil semasa latihan.'
      }
    ]
  },
  {
    id: 'bio-cellular-respiration',
    title: 'BIO 101: Respirasi Sel & Sintesis Tenaga ATP',
    subject: 'Biologi & Biokimia',
    folder: 'Midterm Prep',
    duration: '35 minit',
    date: '2026-09-28',
    summary: 'Penerokaan mendalam Glikolisis, Kitaran Asid Sitrik (Krebs), pemfosforilan oksidatif, dan mekanisme kemiosmotik oleh enzim ATP sintase merentasi membran dalaman mitokondria.',
    markdownNotes: `# BIO 101: Respirasi Sel & Bioenergetik

## 1. Gambaran Keseluruhan & Tindak Balas Bersih
Respirasi sel ialah laluan katabolik di mana sel menuai tenaga kimia daripada molekul glukosa:

$$\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 30\\text{-}32\\text{ ATP}$$

Proses ini berlaku dalam 4 peringkat berbeza:
1. **Glikolisis** (Sitoplasma / Sitosol)
2. **Pengoksidaan Piruvat** (Matriks Mitokondria)
3. **Kitaran Asid Sitrik / Krebs** (Matriks Mitokondria)
4. **Pemfosforilan Oksidatif** (Membran Dalaman Mitokondria)

---

## 2. Pecahan Hasil ATP bagi Setiap Molekul Glukosa
| Peringkat | Substrat Utama | ATP Terus | Koenzim Terturun |
| :--- | :--- | :--- | :--- |
| **Glikolisis** | Glukosa | 2 ATP (bersih) | 2 NADH |
| **Dekarboksilasi Piruvat** | 2 Piruvat | 0 ATP | 2 NADH |
| **Kitaran Asid Sitrik** | 2 Asetil-CoA | 2 GTP (ATP) | 6 NADH, 2 FADH$_2$ |
| **Pemfosforilan Oksidatif** | 10 NADH, 2 FADH$_2$ | ~26-28 ATP | Hasil sampingan H$_2$O |
`,
    mindmapMarkdown: `# Respirasi Sel
## 1. Glikolisis (Sitoplasma)
### Pelaburan Tenaga (2 ATP digunakan)
### Pulangan Tenaga (4 ATP + 2 NADH)
### Hasil Bersih: 2 Piruvat + 2 ATP + 2 NADH
## 2. Pengoksidaan Piruvat
### Masuk ke Matriks Mitokondria
### 2 Asetil-CoA terhasil
### 2 CO2 dilepaskan
## 3. Kitaran Asid Sitrik (Matriks)
### Oksaloasetat + Asetil-CoA -> Sitrat
### Setiap glukosa: 6 NADH, 2 FADH2, 2 GTP, 4 CO2
## 4. Pemfosforilan Oksidatif
### Rantaian Pengangkutan Elektron (Kompleks I-IV)
### Kecerunan Proton (Ruang Antara Membran)
### Kemiosmosis melalui ATP Sintase
### Penerima Elektron Terakhir: O2 -> H2O
`,
    flashcards: [
      {
        id: 'fc-bio-1',
        front: 'Di manakah glikolisis berlaku dalam sel eukariot?',
        back: 'Dalam sitosol / sitoplasma (di luar organel mitokondria).',
        tag: 'Lokasi Sel'
      },
      {
        id: 'fc-bio-2',
        front: 'Apakah penerima elektron terakhir dalam rantaian pengangkutan elektron mitokondria?',
        back: 'Oksigen molekul (O2), yang diturunkan untuk membentuk air (H2O).',
        tag: 'Pemfosforilan Oksidatif'
      },
      {
        id: 'fc-bio-3',
        front: 'Berapakah bilangan molekul ATP bersih yang dihasilkan secara terus daripada Glikolisis per molekul glukosa?',
        back: '2 ATP bersih (4 dihasilkan tolak 2 yang digunakan pada fasa pelaburan).',
        tag: 'Bioenergetik'
      }
    ],
    quiz: [
      {
        id: 'qz-bio-1',
        question: 'Enzim manakah yang memanfaatkan daya penggerak proton merentasi membran dalaman mitokondria untuk menjana ATP daripada ADP dan Pi?',
        options: ['Piruvat kinase', 'ATP Sintase (Kompleks V)', 'Heksokinase', 'Fosfofruktokinase'],
        correctIndex: 1,
        explanation: 'ATP Sintase (Kompleks V) menggandingkan aliran proton menuruni kecerunan dari ruang antara membran ke dalam matriks dengan sintesis ATP.'
      }
    ]
  }
];
