# ML Research Interview Preparation Handbook

This handbook is a broad interview bank for the **DL/ML Research Intern (LLMs & VLMs)** role at HyperVerge. It covers likely fundamentals, coding, model-training, LLM/VLM, document-AI, and project questions. Use the answers as a framework: speak naturally and only claim work you have actually done.

## How to answer

Use a compact structure: **answer the question directly, give the reason, then give one concrete example or trade-off.** For project questions, distinguish Sonique's implemented work from its planned next steps.

---

## 1. Opening and motivation

**Interviewer:** Tell me about yourself.

**Candidate:** I am interested in applied deep learning and in making AI systems measurable and reliable. My main project is Sonique, an AI voice platform for text-to-speech and custom voice workflows. Alongside the product work, I added ML-oriented artifacts: a reproducible TTS evaluation harness, synthetic robustness prompts, and a small PyTorch voice-quality classification baseline. I enjoy the full lifecycle—data, training, debugging, evaluation, and production feedback.

**Interviewer:** Why this DL/ML research internship?

**Candidate:** It matches how I want to grow: not only consuming model APIs, but understanding model behavior, designing evaluations, debugging failures, and adapting models for real-world visual or document problems. I am particularly interested in LLMs, VLMs, and the trade-offs between quality, latency, robustness, and cost.

**Interviewer:** Why HyperVerge?

**Candidate:** The combination of computer vision, document/identity workflows, and modern multimodal models is compelling because errors have direct user impact. I want to work where research evaluation connects to robust production systems rather than being only a leaderboard exercise.

**Interviewer:** Explain Sonique in 30 seconds.

**Candidate:** Sonique is an AI voice-generation platform with text-to-speech and custom voice workflows. It has production concerns such as authentication, storage, billing, reliability, and latency. I extended it with repeatable TTS evaluation for failures, latency, loudness, clipping, duration, and difficult prompts, plus a PyTorch baseline to identify unusable audio.

**Interviewer:** Is Sonique only an API wrapper?

**Candidate:** The generation path uses an external TTS service, so I would not claim I trained the core speech model. My ML work is around making the system evaluation-driven: benchmark design, synthetic test data, objective audio metrics, failure analysis, observability, and a trainable PyTorch quality-classification baseline. The next step is open-weight model adaptation or fine-tuning.

---

## 2. Python foundations

**Interviewer:** List versus tuple?

**Candidate:** A list is mutable; a tuple is immutable. I use tuples for fixed records and lists when I need to change the collection.

**Interviewer:** What is a generator?

**Candidate:** A generator yields values lazily rather than materializing them all in memory. It is useful for large files, streaming data, and batch pipelines.

**Interviewer:** What is an iterator?

**Candidate:** An iterator is an object that returns items one at a time through `__next__`. A generator is an easy way to create an iterator with `yield`.

**Interviewer:** What are decorators used for?

**Candidate:** They wrap functions to add reusable behavior such as logging, timing, caching, authentication, or input validation without changing the function's main logic.

**Interviewer:** What is a context manager?

**Candidate:** It manages setup and cleanup reliably, usually via `with`. For example, `with open(...)` closes a file even if an exception occurs.

**Interviewer:** What is the GIL?

**Candidate:** In CPython, the Global Interpreter Lock allows only one thread to execute Python bytecode at once. Threads are still useful for I/O; multiprocessing is usually better for CPU-heavy work.

**Interviewer:** Shallow versus deep copy?

**Candidate:** A shallow copy copies the outer container but shares nested objects. A deep copy recursively copies nested objects. This matters when modifying nested experiment configurations or data structures.

**Interviewer:** How do you make Python code reproducible?

**Candidate:** I set seeds, version data and configuration, pin dependencies, log commands and Git revisions, save checkpoints, and keep a fixed evaluation set.

**Interviewer:** How do you process data larger than RAM?

**Candidate:** Stream it in chunks, use generators or memory mapping, and use a `Dataset`/`DataLoader` that loads batches on demand.

**Interviewer:** How do you handle exceptions in production code?

**Candidate:** Catch specific exceptions, log useful non-sensitive context, return a clear failure state, and avoid swallowing errors with an unqualified `except`.

---

## 3. Python coding prompts

**Interviewer:** Find the first non-repeating character in a string.

**Candidate:** Count each character, then scan in original order. This is `O(n)` time.

```python
from collections import Counter

def first_non_repeating(text: str):
    counts = Counter(text)
    return next((c for c in text if counts[c] == 1), None)
```

**Interviewer:** Return duplicates in a list.

**Candidate:** Use a set for previously seen values and another set for duplicates.

```python
def duplicates(items):
    seen, repeated = set(), set()
    for item in items:
        if item in seen:
            repeated.add(item)
        seen.add(item)
    return list(repeated)
```

**Interviewer:** How do you batch a sequence?

```python
def batches(items, size):
    for i in range(0, len(items), size):
        yield items[i:i + size]
```

**Interviewer:** How do you compute a running mean without storing all values?

```python
def running_mean(values):
    total = 0.0
    for n, value in enumerate(values, start=1):
        total += value
        yield total / n
```

**Interviewer:** What is the average lookup complexity of a dictionary or set?

**Candidate:** Average `O(1)` because they are hash tables. I still avoid assuming perfect performance in adversarial or pathological cases.

**Interviewer:** How do you debug a coding answer under interview pressure?

**Candidate:** I state assumptions, test empty input and boundary cases, explain complexity, and use a small example to validate the logic before optimizing.

---

## 4. Linear algebra, probability, and optimization

**Interviewer:** What is a vector, matrix, and tensor?

**Candidate:** A vector is one-dimensional, a matrix is two-dimensional, and a tensor is a general multi-dimensional array. Model parameters, batches, images, and attention scores are usually tensors.

**Interviewer:** What is a dot product used for in ML?

**Candidate:** It measures a weighted alignment between vectors. Linear layers, cosine similarity, and attention scores rely on dot products.

**Interviewer:** Why normalize features?

**Candidate:** Feature scales can otherwise dominate optimization. Normalization often improves conditioning and makes training more stable.

**Interviewer:** What is an expectation?

**Candidate:** It is the probability-weighted average value of a random variable. Empirically, we estimate it with averages over samples.

**Interviewer:** What is variance?

**Candidate:** Variance measures spread around the mean. In ML, high variance can also refer to a model that is overly sensitive to the training data.

**Interviewer:** What is bias-variance trade-off?

**Candidate:** High bias causes systematic underfitting; high variance causes overfitting. The goal is good performance on unseen data, not merely low training error.

**Interviewer:** Explain gradient descent.

**Candidate:** It updates parameters in the direction that reduces loss: `theta = theta - learning_rate * gradient`.

**Interviewer:** Batch, stochastic, and mini-batch gradient descent?

**Candidate:** Batch uses all data per update, stochastic uses one example, and mini-batch uses a small group. Mini-batch is the practical standard because it balances noisy gradients with hardware efficiency.

**Interviewer:** What does a learning-rate schedule do?

**Candidate:** It changes learning rate during training. Warmup can stabilize early updates; decay can help convergence later.

---

## 5. Deep-learning fundamentals

**Interviewer:** Why are activation functions needed?

**Candidate:** Without nonlinear activations, stacked linear layers are equivalent to one linear transformation. Activations let networks learn complex functions.

**Interviewer:** ReLU versus GELU?

**Candidate:** ReLU is simple and efficient: `max(0, x)`. GELU is smooth and commonly used in Transformer architectures.

**Interviewer:** What is backpropagation?

**Candidate:** It uses the chain rule to efficiently compute the loss gradient for every trainable parameter through the computation graph.

**Interviewer:** What is vanishing gradient?

**Candidate:** Gradients become very small through many layers, preventing early layers from learning effectively. Residual connections, normalization, and good initialization help.

**Interviewer:** What is exploding gradient?

**Candidate:** Gradients become extremely large, causing unstable updates or NaNs. I investigate the cause and may use gradient clipping as protection.

**Interviewer:** What is dropout?

**Candidate:** During training, dropout randomly suppresses some activations to reduce co-adaptation and overfitting. It is disabled during evaluation.

**Interviewer:** Batch normalization versus layer normalization?

**Candidate:** Batch norm uses batch statistics and is common in CNNs. Layer norm normalizes features within each sample, which makes it suitable for Transformers and variable sequence lengths.

**Interviewer:** Why do residual connections help?

**Candidate:** They give information and gradients a direct path through layers, making very deep networks easier to optimize.

**Interviewer:** What is weight decay?

**Candidate:** It penalizes large weights, commonly serving as L2-style regularization. With AdamW, weight decay is decoupled from the adaptive update.

**Interviewer:** Underfitting versus overfitting?

**Candidate:** Underfitting means poor train and validation performance. Overfitting means strong training performance but weak validation performance.

---

## 6. Loss functions and evaluation

**Interviewer:** Why use cross-entropy for classification?

**Candidate:** It compares predicted class probabilities with targets and strongly penalizes confident incorrect predictions. In PyTorch, `CrossEntropyLoss` expects raw logits.

**Interviewer:** Logits versus probabilities?

**Candidate:** Logits are raw scores. Softmax maps multi-class logits to probabilities; sigmoid maps a binary logit to a probability.

**Interviewer:** Why not apply softmax before `CrossEntropyLoss`?

**Candidate:** PyTorch applies a numerically stable log-softmax internally. Applying softmax first is redundant and can hurt numerical stability.

**Interviewer:** Precision versus recall?

**Candidate:** Precision asks how many predicted positives were correct. Recall asks how many actual positives were found.

**Interviewer:** What is F1?

**Candidate:** The harmonic mean of precision and recall. It is useful when classes are imbalanced and both error types matter.

**Interviewer:** Why can accuracy be misleading?

**Candidate:** For a heavily imbalanced dataset, predicting only the majority class can have high accuracy while being useless for the minority class.

**Interviewer:** ROC-AUC versus PR-AUC?

**Candidate:** ROC-AUC is useful for ranking across thresholds; PR-AUC is usually more informative for rare positive classes because it focuses on precision and recall.

**Interviewer:** What is calibration?

**Candidate:** A calibrated model's predicted confidence matches its observed correctness frequency. It is important for automation-versus-human-review decisions.

**Interviewer:** What is a confusion matrix?

**Candidate:** A table showing actual versus predicted classes. It reveals which error types are occurring, not just one aggregate score.

**Interviewer:** How do you select a decision threshold?

**Candidate:** I select it based on validation data and business cost of false positives and false negatives, then verify it on a held-out test set.

---

## 7. PyTorch interview questions

**Interviewer:** Explain `Dataset` and `DataLoader`.

**Candidate:** `Dataset` defines how a sample and label are retrieved. `DataLoader` batches, shuffles, and can parallelize loading.

**Interviewer:** Walk through a training step.

```python
model.train()
for x, y in loader:
    x, y = x.to(device), y.to(device)
    optimizer.zero_grad()
    logits = model(x)
    loss = criterion(logits, y)
    loss.backward()
    optimizer.step()
```

**Candidate:** I also log loss and validation metrics, save the best checkpoint by a pre-defined validation criterion, and keep training and evaluation transformations consistent.

**Interviewer:** Why call `optimizer.zero_grad()`?

**Candidate:** PyTorch accumulates gradients by default. We clear them before the next update unless intentionally using gradient accumulation.

**Interviewer:** `model.train()` versus `model.eval()`?

**Candidate:** `train()` enables training behavior such as dropout. `eval()` disables dropout and makes batch normalization use running statistics.

**Interviewer:** Why use `torch.no_grad()` for evaluation?

**Candidate:** It prevents gradient graph construction, reducing memory use and speeding evaluation.

**Interviewer:** How do you move to GPU safely?

**Candidate:** Put the model and every input/label tensor on the same device. Device mismatch is a common runtime error.

**Interviewer:** Why save optimizer and scheduler state in a checkpoint?

**Candidate:** Optimizers and schedulers have internal state. Saving them makes resumed training consistent with the original run.

**Interviewer:** What is mixed precision?

**Candidate:** It uses lower-precision arithmetic where safe to reduce memory and speed GPU training, while retaining higher precision for numerically sensitive operations.

**Interviewer:** What is gradient accumulation?

**Candidate:** It sums gradients across several small batches before an optimizer update, effectively simulating a larger batch when memory is limited.

---

## 8. Training-debugging scenarios

**Interviewer:** Training loss is not decreasing. What do you do?

**Candidate:** First I try to overfit a tiny fixed subset. If that fails, I check labels, loss/output compatibility, learning rate, input normalization, model mode, gradient flow, and whether parameters are actually being updated.

**Interviewer:** Loss becomes NaN.

**Candidate:** I check inputs, labels, activations, gradients, and loss for NaNs/Infs; lower the learning rate; inspect mixed precision; reproduce on one batch; and use anomaly detection only when needed because it is slow.

**Interviewer:** Validation is implausibly high.

**Candidate:** I suspect leakage. I check duplicates, source identifiers, speakers, sessions, timestamps, preprocessing fitted on all data, and accidental evaluation on training data.

**Interviewer:** GPU utilization is low.

**Candidate:** I profile the pipeline, then look at data loading, augmentation, disk I/O, CPU-to-GPU transfer, batch size, number of workers, pinning memory, and repeated preprocessing.

**Interviewer:** Train accuracy rises while validation falls.

**Candidate:** That is typical overfitting. I inspect the split, add or improve data augmentation, use weight decay/early stopping, reduce capacity if necessary, and collect more representative data.

**Interviewer:** Results vary across runs.

**Candidate:** I set seeds and deterministic options where possible, record configurations, evaluate variance across runs, and distinguish meaningful gains from random noise.

**Interviewer:** What is the first check for a new dataset?

**Candidate:** A data audit: labels, class balance, missing values, duplicates, source distribution, leakage risk, corrupted files, and random sample inspection.

---

## 9. CNNs, vision, and transfer learning

**Interviewer:** What is convolution?

**Candidate:** A small learnable kernel slides across an image or feature map to detect local patterns such as edges and textures.

**Interviewer:** Why is weight sharing useful?

**Candidate:** The same filter can detect a pattern anywhere in an image, reducing parameters and giving useful locality/translation bias.

**Interviewer:** What is pooling?

**Candidate:** Pooling reduces spatial resolution while retaining salient information. Modern networks may instead use strided convolutions.

**Interviewer:** What is transfer learning?

**Candidate:** Start from a pretrained model and adapt it to a task. It reduces data and compute requirements compared with training from scratch.

**Interviewer:** Freeze versus unfreeze layers?

**Candidate:** I freeze layers when data or compute is limited and the pretrained features are relevant. I progressively unfreeze when the target domain differs enough to require deeper adaptation.

**Interviewer:** CNN versus Vision Transformer?

**Candidate:** CNNs have strong local inductive bias and work well with limited data. ViTs use patch tokens and global attention, often benefiting from large-scale pretraining.

---

## 10. Transformer architectures

**Interviewer:** Explain self-attention.

**Candidate:** Tokens are projected to queries, keys, and values. Query-key similarity determines attention weights, which form weighted combinations of values:

`softmax(QK^T / sqrt(d_k)) V`.

**Interviewer:** Why divide by `sqrt(d_k)`?

**Candidate:** Dot products grow with dimension. Scaling prevents softmax from saturating and keeps gradients stable.

**Interviewer:** What is multi-head attention?

**Candidate:** Several attention heads learn different relationships in parallel, then their results are combined.

**Interviewer:** Why are positional embeddings required?

**Candidate:** Self-attention alone does not encode word order. Positional information lets the model distinguish different sequences with the same tokens.

**Interviewer:** What is causal masking?

**Candidate:** It prevents a decoder token from attending to future tokens, preserving next-token prediction during training.

**Interviewer:** Encoder-only, decoder-only, encoder-decoder?

**Candidate:** Encoder-only models use bidirectional context for representations. Decoder-only models generate autoregressively. Encoder-decoder models transform an input sequence into an output sequence and are common in translation/summarization.

**Interviewer:** What is a residual connection in a Transformer?

**Candidate:** It adds a block's input to its output, improving optimization and gradient flow.

**Interviewer:** Why is layer normalization used in Transformers?

**Candidate:** It is stable across variable-length sequences and does not depend on batch statistics.

**Interviewer:** Why is long-context attention difficult?

**Candidate:** Standard attention compares all token pairs, producing roughly quadratic compute and memory growth with context length.

**Interviewer:** How is efficient attention achieved?

**Candidate:** Efficient kernels such as FlashAttention reduce memory overhead; architecture approaches include sparse/sliding-window attention, retrieval, chunking, and key-value caching.

---

## 11. LLM fundamentals

**Interviewer:** How does an LLM generate text?

**Candidate:** It tokenizes context, predicts next-token probabilities, selects or samples a token, appends it, and repeats until a stopping criterion.

**Interviewer:** What is tokenization?

**Candidate:** It maps text to token IDs, usually using subwords so both common and rare words can be represented efficiently.

**Interviewer:** What does temperature do?

**Candidate:** It scales logits before sampling. Lower temperature is more deterministic; higher temperature is more diverse but can be less reliable.

**Interviewer:** Top-k versus top-p?

**Candidate:** Top-k limits sampling to the k most likely tokens. Top-p selects from the smallest set whose cumulative probability exceeds p.

**Interviewer:** What is a hallucination?

**Candidate:** A plausible-looking but unsupported or incorrect output. I reduce it with grounded context, constrained output, verification, abstention, and task-specific evaluation.

**Interviewer:** What is RAG?

**Candidate:** Retrieval-Augmented Generation retrieves relevant documents at inference time and supplies them as context for a generative model.

**Interviewer:** RAG versus fine-tuning?

**Candidate:** RAG is best for changing factual knowledge and citations. Fine-tuning changes behavior, style, or task competence. They are complementary.

**Interviewer:** What is key-value caching?

**Candidate:** During autoregressive decoding, it reuses prior attention keys and values rather than recomputing them for every generated token.

**Interviewer:** What is quantization?

**Candidate:** Storing or computing weights/activations at lower precision, such as int8 or 4-bit, to reduce memory and often improve inference speed, subject to quality validation.

---

## 12. Fine-tuning, PEFT, and LoRA

**Interviewer:** What is fine-tuning?

**Candidate:** Continuing training from a pretrained model on a task- or domain-specific dataset.

**Interviewer:** What is supervised fine-tuning (SFT)?

**Candidate:** Training a pretrained LLM on prompt-response examples to teach desired task behavior, format, and style.

**Interviewer:** What is PEFT?

**Candidate:** Parameter-Efficient Fine-Tuning adapts a model by training a small subset or added parameters rather than all base-model weights.

**Interviewer:** Explain LoRA.

**Candidate:** LoRA freezes a base weight matrix and learns a low-rank update, typically written as `W' = W + BA`, where the small matrices `B` and `A` require far fewer trainable parameters.

**Interviewer:** Why use LoRA instead of full fine-tuning?

**Candidate:** It lowers memory, compute, and adapter-storage cost, enables faster experimentation, and permits multiple task adapters. Full fine-tuning may be preferred when maximum adaptation capacity and resources are available.

**Interviewer:** What is QLoRA?

**Candidate:** A common approach that fine-tunes LoRA adapters while the base model is loaded in low-bit quantized form, substantially reducing memory needs.

**Interviewer:** What is catastrophic forgetting?

**Candidate:** Fine-tuning can degrade capabilities learned during pretraining. I watch for it with broad held-out evaluation, careful learning rates, representative data, and sometimes mixing data.

**Interviewer:** How would you choose training data for fine-tuning?

**Candidate:** Start with task definition, data permissions, quality, diversity, de-duplication, correct formatting, and a held-out evaluation set that represents expected use—not just training distribution.

**Interviewer:** How do you know fine-tuning helped?

**Candidate:** Compare against the base model on held-out task metrics, human quality, safety/robustness, latency, cost, and qualitative failure cases.

---

## 13. RLHF and preference alignment

**Interviewer:** What is RLHF?

**Candidate:** Reinforcement Learning from Human Feedback aligns model behavior to human preferences. A common path is SFT, human preference collection, reward-model training, and policy optimization.

**Interviewer:** What is a reward model?

**Candidate:** It predicts which response people would prefer, based on ranked response pairs. It becomes an optimization signal for policy training.

**Interviewer:** What is DPO?

**Candidate:** Direct Preference Optimization learns from chosen/rejected response pairs more directly, without separately training a reward model and running a full RL loop.

**Interviewer:** What is reward hacking?

**Candidate:** The model exploits weaknesses in the reward signal, optimizing for a high score without genuinely satisfying the intended objective.

**Interviewer:** Risks of preference alignment?

**Candidate:** Biased annotator preferences, reduced diversity, over-optimization for style, safety blind spots, reward hacking, and regression in useful capabilities.

**Interviewer:** How do you evaluate alignment?

**Candidate:** Held-out preference sets, human review, factuality checks, adversarial prompts, safety tests, refusal quality, and regression testing against the base model.

---

## 14. VLMs and multimodal learning

**Interviewer:** What is a VLM?

**Candidate:** A Vision Language Model combines a visual encoder with a language model so it can interpret images and text jointly.

**Interviewer:** How is an image passed to an LLM?

**Candidate:** A vision encoder, often a ViT, converts image patches into embeddings. A projection layer maps those embeddings into the language model's token representation space.

**Interviewer:** What is contrastive image-text learning?

**Candidate:** It learns aligned image and text representations by bringing matched image-text pairs closer and separating mismatched pairs, as in CLIP-style training.

**Interviewer:** What are VLM use cases?

**Candidate:** Visual question answering, document understanding, image captioning, OCR-related workflows, image retrieval, product inspection, and identity-document analysis.

**Interviewer:** What are common VLM failures?

**Candidate:** Hallucinated content, weak reading of small text, layout mistakes, sensitivity to blur/glare/rotation, poor counting, domain shift, and unsupported inferences.

**Interviewer:** What is visual grounding?

**Candidate:** Connecting a response to the relevant image region or source evidence. It improves traceability in high-stakes systems.

**Interviewer:** How do you evaluate a VLM?

**Candidate:** Task-specific metrics such as field-level F1/exact match, region grounding, document-level success, robustness slices, latency, calibration, and human review.

---

## 15. Document AI and computer vision

**Interviewer:** Design a document-understanding pipeline.

**Candidate:** Start with the business output: classification, extraction, verification, or question answering. Then add quality checks, orientation correction, OCR or VLM extraction, layout handling, field validation, confidence thresholds, and human review for uncertain cases.

**Interviewer:** OCR versus OCR-free VLM?

**Candidate:** OCR pipelines explicitly extract text and often provide bounding boxes, which helps auditability. OCR-free VLMs can reason jointly over visual layout and language, but need careful validation for small text and hallucinations.

**Interviewer:** How do you make extracted fields reliable?

**Candidate:** Combine model outputs with schema checks, regex, date ranges, checksums where available, document-type rules, confidence calibration, and source evidence.

**Interviewer:** How would you handle low-quality documents?

**Candidate:** Detect blur, glare, cropping, rotation, and resolution problems early; request recapture when necessary; train/evaluate with realistic augmentations; and avoid pretending confidence is high when the image quality is poor.

**Interviewer:** What is domain shift in document AI?

**Candidate:** The deployment documents differ from training data—for example new templates, cameras, languages, or lighting. I monitor performance by source/type and update datasets deliberately.

**Interviewer:** Why use human-in-the-loop review?

**Candidate:** For low-confidence or high-risk decisions, human review reduces harm and creates labeled feedback that can improve later models.

---

## 16. Sonique evaluation and audio questions

**Interviewer:** Why does Sonique need an evaluation harness?

**Candidate:** Human listening alone is subjective and slow. A repeatable harness detects regressions across versions, voices, prompt categories, and settings before users are affected.

**Interviewer:** Which Sonique metrics matter?

**Candidate:** Quality metrics include intelligibility, naturalness, speaker similarity, loudness, and clipping. Operational metrics include p50/p90/p99 latency, failure/retry rate, cost, and completion rate. I also break results down by prompt category.

**Interviewer:** What difficult prompts do you test?

**Candidate:** Multilingual and code-switched text, punctuation-heavy text, abbreviations, numerals, long narration, names, and identity-verification-like prompts.

**Interviewer:** What is clipping?

**Candidate:** Audio clipping occurs when amplitude exceeds the representable range and waveform peaks flatten, creating distortion.

**Interviewer:** What are likely TTS failure modes?

**Candidate:** Incorrect pronunciation, weak prosody on long text, code-switching errors, clipping or low loudness, noisy reference audio, provider failures, high latency, and inconsistent voice similarity.

**Interviewer:** How would you improve the voice-quality classifier?

**Candidate:** Use a larger human-labeled dataset, speaker-disjoint splits, class balancing, audio augmentation, pretrained audio embeddings, and report false-accept/false-reject rates with calibrated thresholds.

**Interviewer:** What would you log for a generation?

**Candidate:** Model/provider version, prompt category and length, voice ID, latency, duration, file size, retries, errors, and quality metrics where safe. I would avoid storing sensitive content unnecessarily.

---

## 17. ML system design and MLOps

**Interviewer:** Design a model-serving system.

**Candidate:** I would include input validation, authentication, rate limiting, a synchronous or asynchronous request path based on latency, model inference, output storage, retries, observability, model/version metadata, and an evaluation/feedback loop.

**Interviewer:** Online versus batch inference?

**Candidate:** Online inference prioritizes per-request latency. Batch inference prioritizes throughput and cost efficiency for offline workloads.

**Interviewer:** What is model drift?

**Candidate:** Performance changes after deployment because input distributions, templates, user behavior, or upstream systems change. It requires monitoring and periodic re-evaluation.

**Interviewer:** What is data drift?

**Candidate:** A change in the input-data distribution. It may or may not immediately create performance degradation, but it is an important warning signal.

**Interviewer:** How do you reduce inference cost?

**Candidate:** Right-size the model, batch where possible, cache repeated requests, use quantization after validation, route simple cases to smaller models, and track cost per successful outcome.

**Interviewer:** What makes an experiment reproducible?

**Candidate:** Versioned data, code, config, seed, environment, metrics, checkpoints, and a fixed evaluation protocol.

**Interviewer:** What is an ablation study?

**Candidate:** Remove or alter one component at a time to determine which parts of a method actually produce the measured gain.

---

## 18. Research judgment

**Interviewer:** How do you read a paper?

**Candidate:** I identify the problem, assumptions, method, dataset, metric, baseline, ablations, limitations, and whether the result would transfer to the target use case. Then I reproduce a small baseline before proposing extensions.

**Interviewer:** What makes a benchmark misleading?

**Candidate:** Leakage, contamination, non-representative data, weak baselines, tuning on the test set, random variation, or a metric that does not reflect user value.

**Interviewer:** How do you decide an experiment succeeded?

**Candidate:** I define the hypothesis and success threshold before running it, compare with a credible baseline, inspect failure cases, report uncertainty when possible, and consider deployment trade-offs.

**Interviewer:** What if offline metrics improve but users dislike the system?

**Candidate:** The metric is incomplete or misaligned. I investigate user failures, improve the evaluation set and rubric, and avoid optimizing a proxy at the expense of the actual product goal.

**Interviewer:** What if a simpler baseline wins?

**Candidate:** That is valuable. I keep the simpler method unless the complex approach has a demonstrated advantage in an important slice or future scaling requirement.

---

## 19. Behavioral interview questions

**Interviewer:** Tell me about a difficult bug.

**Candidate:** I would answer with a real example using STAR: situation, task, action, result. Emphasize how I made the bug reproducible, isolated variables, added instrumentation, validated the fix, and documented the prevention step.

**Interviewer:** Tell me about a failure.

**Candidate:** I would choose a genuine example where an assumption was wrong, explain the impact without excuses, show the corrective action, and describe the durable lesson. In ML, a common lesson is that a strong metric is not meaningful without a realistic, leakage-free evaluation split.

**Interviewer:** How do you respond to feedback?

**Candidate:** I ask for concrete examples, identify whether the issue is data, evaluation, engineering, communication, or requirements, and turn it into an actionable improvement.

**Interviewer:** How do you work with an unfamiliar topic?

**Candidate:** I learn the core concepts, consult primary sources, implement a small baseline, validate it on a controlled test, and then scale only once I understand the failure modes.

**Interviewer:** Why should we hire you?

**Candidate:** I bring strong curiosity about LLMs and VLMs with practical engineering discipline. I like building systems end-to-end, but I also care about evaluation, debugging, robustness, and the evidence behind a claimed improvement.

---

## 20. Questions to ask the interviewer

1. What tasks will an intern own in the first 90 days?
2. Which metrics define success for your LLM/VLM systems: quality, latency, safety, calibration, or robustness?
3. How are experiments reviewed and how is failure analysis shared within the team?
4. Will the role work mainly with proprietary data, public benchmarks, or both?
5. What distinguishes a strong intern from an average one on this team?

---

## One-day revision checklist

- Explain Sonique honestly in 30 seconds and 2 minutes.
- Practice the PyTorch training loop without notes.
- Be able to explain overfitting, cross-entropy, precision/recall/F1, attention, LoRA, RAG, and VLMs.
- Prepare one real debugging story, one teamwork story, and one failure/learning story using STAR.
- Practice asking two thoughtful questions about evaluation and the team's real use cases.
- Do not invent fine-tuning, RLHF, or VLM experience. Say what you know, relate it to Sonique, and describe a concrete approach you would take.
