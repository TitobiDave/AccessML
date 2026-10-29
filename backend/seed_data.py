"""Course content seeded on first start."""
from sqlalchemy.orm import Session

from models import Lab, Lesson, Module, Quiz, QuizQuestion, User


# ---------------------------------------------------------------- sections
# One lab per section. section_slug must match a section slug in the lesson content.
LAB_SPECS = [
    dict(
        slug="lab-variables", section_slug="variables", title="Create and print variables",
        instructions=(
            "Create two more variables: `height` set to `1.68` and `is_student` set to `True`.\n\n"
            "Then print one line using an **f-string** so the output is exactly:\n\n"
            "```text\nAda is 36 and 1.68m tall\n```"
        ),
        starter_code='name = "Ada"\nage = 36\n# TODO: create height and is_student\n# TODO: print the sentence with an f-string\n',
        solution_code='name = "Ada"\nage = 36\nheight = 1.68\nis_student = True\nprint(f"{name} is {age} and {height}m tall")\n',
        expected_output="Ada is 36 and 1.68m tall",
        required_code=["height", "is_student"],
        hints=["An f-string starts with f before the quote: f\"{name} ...\""],
    ),
    dict(
        slug="lab-operators", section_slug="operators", title="Split seconds into h:m:s",
        instructions=(
            "`total_seconds` is `3725`. Use `//` and `%` to work out the hours, minutes and seconds, "
            "then print them on one line separated by spaces.\n\n```text\n1 2 5\n```"
        ),
        starter_code="total_seconds = 3725\n# TODO: hours, minutes, seconds\n",
        solution_code=(
            "total_seconds = 3725\nhours = total_seconds // 3600\nremaining = total_seconds % 3600\n"
            "minutes = remaining // 60\nseconds = remaining % 60\nprint(hours, minutes, seconds)\n"
        ),
        expected_output="1 2 5",
        required_code=["//", "%"],
        hints=["There are 3600 seconds in an hour. `%` gives what's left over.", "Repeat the same idea with 60 for minutes."],
    ),
    dict(
        slug="lab-strings", section_slug="strings", title="Clean up an email address",
        instructions=(
            "Clean `email` with `strip()` and `lower()`, split it at `@`, then print the username and "
            "the domain on separate lines.\n\n```text\nada.lovelace\nexample.com\n```"
        ),
        starter_code='email = "  Ada.Lovelace@Example.com  "\n# TODO: clean, split, print\n',
        solution_code='email = "  Ada.Lovelace@Example.com  "\nclean = email.strip().lower()\nusername, domain = clean.split("@")\nprint(username)\nprint(domain)\n',
        expected_output="ada.lovelace\nexample.com",
        required_code=["strip", "split"],
        hints=['"a@b".split("@") gives ["a", "b"]. You can unpack it into two names.'],
    ),
    dict(
        slug="lab-collections", section_slug="collections", title="Update a dictionary",
        instructions=(
            "1. Add `\"Chioma\": 95` to `lookup`.\n2. Change Tunde's score to `75`.\n"
            "3. Print Tunde's score.\n4. Print the score for `\"Emeka\"` using `.get()` with the fallback `\"n/a\"`.\n"
            "5. Print how many students are in `lookup`.\n\n```text\n75\nn/a\n3\n```"
        ),
        starter_code='lookup = {"Ada": 88, "Tunde": 72}\n# TODO\n',
        solution_code='lookup = {"Ada": 88, "Tunde": 72}\nlookup["Chioma"] = 95\nlookup["Tunde"] = 75\nprint(lookup["Tunde"])\nprint(lookup.get("Emeka", "n/a"))\nprint(len(lookup))\n',
        expected_output="75\nn/a\n3",
        required_code=[".get("],
        hints=["Assigning to a new key adds it; assigning to an existing key updates it."],
    ),
    dict(
        slug="lab-conditionals", section_slug="conditionals", title="Grade a score",
        instructions=(
            "Using `if` / `elif` / `else`, print `A` for 90+, `B` for 80-89, `C` for 70-79 and `F` below 70.\n\n"
            "With `score = 82` the output must be:\n\n```text\nB\n```\n\n"
            "Try `95` and `50` yourself first, then set it back to `82` before checking."
        ),
        starter_code="score = 82\n# TODO\n",
        solution_code='score = 82\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 70:\n    print("C")\nelse:\n    print("F")\n',
        expected_output="B",
        required_code=["elif"],
        hints=["Check the highest threshold first."],
    ),
    dict(
        slug="lab-loops", section_slug="loops", title="Count passes and find the best",
        instructions=(
            "Loop over `scores` once. Count how many are 70 or more, and track the highest score. "
            "Don't use `max()`.\n\n```text\nPasses: 3\nHighest: 95\n```"
        ),
        starter_code="scores = [72, 88, 95, 60]\n# TODO: set up counters before the loop\n",
        solution_code='scores = [72, 88, 95, 60]\npasses = 0\nbest = scores[0]\nfor s in scores:\n    if s >= 70:\n        passes += 1\n    if s > best:\n        best = s\nprint(f"Passes: {passes}")\nprint(f"Highest: {best}")\n',
        expected_output="Passes: 3\nHighest: 95",
        required_code=["for"], forbidden_code=["max("],
        hints=["Set `passes = 0` and `best = scores[0]` before the loop."],
    ),
    dict(
        slug="lab-functions", section_slug="functions", title="Write average()",
        instructions=(
            "Write `average(numbers)` that **returns** the mean. If the list is empty, return `0` instead of crashing.\n\n"
            "```text\n78.75\n0\n```"
        ),
        starter_code="# TODO: def average(numbers): ...\n\nprint(average([72, 88, 95, 60]))\nprint(average([]))\n",
        solution_code="def average(numbers):\n    if not numbers:\n        return 0\n    return sum(numbers) / len(numbers)\n\nprint(average([72, 88, 95, 60]))\nprint(average([]))\n",
        expected_output="78.75\n0",
        required_code=["def average", "return"],
        hints=["An empty list is falsy, so `if not numbers:` catches it."],
    ),
    dict(
        slug="lab-scope", section_slug="scope", title="Fix the mutable default",
        instructions=(
            "`add_item` shares one list between calls. Fix it with the `None` pattern so each call starts fresh.\n\n"
            "```text\n['a']\n['b']\n```"
        ),
        starter_code='def add_item(item, items=[]):\n    items.append(item)\n    return items\n\nprint(add_item("a"))\nprint(add_item("b"))\n',
        solution_code='def add_item(item, items=None):\n    if items is None:\n        items = []\n    items.append(item)\n    return items\n\nprint(add_item("a"))\nprint(add_item("b"))\n',
        expected_output="['a']\n['b']",
        required_code=["None"], forbidden_code=["items=[]"],
        hints=["Default to None, then create the list inside the function."],
    ),
    dict(
        slug="lab-errors", section_slug="reading-errors", title="Fix two errors",
        instructions=(
            "This program has **two** bugs. Run it, read the traceback from the bottom, fix the first error, "
            "run again, and fix the second. Don't hardcode the answer.\n\n```text\nTotal: 255\nLast: 95\n```"
        ),
        starter_code='scores = [72, 88, 95]\ntotal = 0\nfor score in scores:\n    total = total + scor\nprint("Total:", total)\nprint("Last:", scores[3])\n',
        solution_code='scores = [72, 88, 95]\ntotal = 0\nfor score in scores:\n    total = total + score\nprint("Total:", total)\nprint("Last:", scores[-1])\n',
        expected_output="Total: 255\nLast: 95",
        forbidden_code=["255"],
        hints=["The first error is a NameError: compare the name to the loop variable.", "The second is an IndexError: a list of 3 items ends at index 2, or use -1."],
    ),
    dict(
        slug="lab-debugging", section_slug="debugging", title="Debug average()",
        instructions=(
            "`average` returns the wrong number and the `assert` fails. Use print debugging to find out why, "
            "fix the function, and keep the `assert` in place.\n\n```text\n4.0\n```"
        ),
        starter_code="def average(numbers):\n    total = 0\n    for n in numbers:\n        total = n\n    return total / len(numbers)\n\nprint(average([2, 4, 6]))\nassert average([2, 4, 6]) == 4\n",
        solution_code="def average(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n    return total / len(numbers)\n\nprint(average([2, 4, 6]))\nassert average([2, 4, 6]) == 4\n",
        expected_output="4.0",
        required_code=["assert"],
        hints=["Print `total` inside the loop. Is it growing?", "`total = n` replaces the total each time instead of adding to it."],
    ),
]
VARIABLES_BODY = r"""
A **variable** is a name that points to a value stored in memory. You create one by assigning with `=`. Python works out the type from the value, so you never declare it.

```python
name = "Ada"
age = 36
height = 1.68
is_student = True
nothing_yet = None
```

### The core data types

| Type | Example | Used for |
|------|---------|----------|
| `int` | `36`, `-4` | counts, indexes, ages |
| `float` | `1.68`, `3.0` | measurements, probabilities, model weights |
| `str` | `"Ada"` | text, labels, file names |
| `bool` | `True`, `False` | yes/no decisions |
| `NoneType` | `None` | "no value yet" |

Check a type with `type()` and display a value with `print()`:

```python
print(type(age))      # <class 'int'>
print(type(height))   # <class 'float'>
```

### Assignment is not equality

`=` means "store the value on the right under the name on the left". It is not a maths equation, so this is valid:

```python
count = 5
count = count + 1    # read count (5), add 1, store 6 back into count
print(count)         # 6
```

Python evaluates the **right side first**, then stores the result.

### Variables can be rebound

A name can point at a different type later, because the type belongs to the value, not the name:

```python
x = 10
x = "ten"      # legal, but confusing
```

Legal does not mean wise. Keep one meaning per name.

### Naming rules and conventions

- Names may contain letters, digits and `_`, and **cannot start with a digit** (`2fast` is invalid).
- Names are **case-sensitive**: `Age` and `age` are different variables.
- Don't reuse built-ins like `list`, `str`, `sum`, `max` as variable names. It silently breaks them.
- Use `snake_case` (`learning_rate`, `num_epochs`) and pick descriptive names. `learning_rate` beats `lr2`.
- `ALL_CAPS` signals a constant by convention, such as `MAX_ITERATIONS = 1000`. Python won't stop you changing it.

### Several at once

```python
width, height = 1920, 1080     # unpacking
a = b = 0                      # both names point at 0
a, b = b, a                    # swap two values
```

> **Common mistake:** writing `=` where you meant `==`. Single `=` stores a value. Double `==` compares two values. You'll meet `==` in the conditionals section.

> **Why this matters for ML:** every dataset, model weight and hyperparameter you use later is held in a variable. Clear names are what make a training script readable a week later.
"""

OPERATORS_BODY = r"""
Operators combine values into new values. This section covers arithmetic, comparison, and logic, plus how to convert between types safely.

### Arithmetic

```python
7 + 2     # 9      addition
7 - 2     # 5      subtraction
7 * 2     # 14     multiplication
7 / 2     # 3.5    true division (always a float)
7 // 2    # 3      floor division (drops the remainder)
7 % 2     # 1      modulo (the remainder)
7 ** 2    # 49     exponent
```

`//` and `%` are a pair: `17 // 5` is `3` and `17 % 5` is `2`, because 5 goes into 17 three times with 2 left over. `%` is how you test for even numbers (`n % 2 == 0`).

### Order of operations

Python follows standard maths precedence: brackets, then `**`, then `* / // %`, then `+ -`. When in doubt, add brackets. They cost nothing and make intent obvious:

```python
2 + 3 * 4       # 14
(2 + 3) * 4     # 20
```

### Shortcut assignment

```python
total = 10
total += 5      # total = total + 5  -> 15
total *= 2      # total = total * 2  -> 30
```

### Comparison operators

They produce a `bool`:

```python
5 == 5     # True    equal
5 != 3     # True    not equal
5 > 3      # True
5 >= 5     # True
3 < 5      # True
```

### Logical operators

```python
age = 20
has_id = True

age >= 18 and has_id     # True: both must be true
age < 13 or age > 65     # False: at least one must be true
not has_id               # False: flips the value
```

### Converting between types

```python
int("42")       # 42
float("3.14")   # 3.14
str(99)         # "99"
int(3.9)        # 3   (truncates, does not round)
round(3.9)      # 4
```

`input()` always returns a **string**, even when the user types digits:

```python
age = input("Age: ")     # user types 30 -> "30"
print(age + 1)           # TypeError: can only concatenate str (not "int") to str
print(int(age) + 1)      # 31
```

### Floating point surprises

Computers store decimals in binary, so some values can't be represented exactly:

```python
print(0.1 + 0.2)           # 0.30000000000000004
print(0.1 + 0.2 == 0.3)    # False
```

Compare floats with a tolerance instead of `==`:

```python
import math
math.isclose(0.1 + 0.2, 0.3)    # True
```

> **Why this matters for ML:** model outputs are floats, so you'll never test them with `==`. Division is also everywhere (averages, rates). Remember `/` always gives a float and `//` floors.
"""

STRINGS_BODY = r"""
Strings hold text. In machine learning they are your labels, column names, file paths and log messages.

### Creating strings

```python
single = 'hello'
double = "it's fine"            # use double quotes when the text has an apostrophe
multi = """'line oneline two'"""                     # triple quotes span lines
```

### Indexing and slicing

Every character has a position, starting at **0**. Negative numbers count from the end.

```python
word = "python"
word[0]      # 'p'
word[-1]     # 'n'
word[0:3]    # 'pyt'   start is included, stop is excluded
word[2:]     # 'thon'
word[:2]     # 'py'
word[::-1]   # 'nohtyp' (reversed)
len(word)    # 6
```

> **Remember:** `word[0:3]` gives positions 0, 1, 2. The stop index is never included.

### Strings are immutable

You can't change a character in place. You build a new string instead:

```python
word[0] = "P"           # TypeError: 'str' object does not support item assignment
word = "P" + word[1:]   # 'Python'
```

### Useful methods

```python
text = "  Hello, World  "
text.strip()            # 'Hello, World'   trims whitespace
text.lower()            # '  hello, world  '
text.upper()
text.replace("World", "Python")
"a,b,c".split(",")      # ['a', 'b', 'c']
"-".join(["a", "b"])    # 'a-b'
"Hello".startswith("He")  # True
"lo" in "Hello"           # True
```

Methods **return new strings** and don't modify the original, so assign the result: `text = text.strip()`.

### f-strings

Put an `f` before the quotes, then wrap expressions in `{}`:

```python
name = "Ada"
score = 0.87654

print(f"{name} scored {score}")        # Ada scored 0.87654
print(f"{name} scored {score:.2f}")    # Ada scored 0.88
print(f"{score:.1%}")                  # 87.7%
print(f"{1234567:,}")                  # 1,234,567
print(f"{3 + 4 = }")                   # 3 + 4 = 7  (handy for debugging)
```

The part after `:` is a format spec. `.2f` means two decimal places, and you'll use it constantly to print accuracy and loss values.

### Escape characters

```python
print("Tab\there")        # Tab    here
print("Line1\nLine2")     # two lines
print("She said \"hi\"")  # quotes inside quotes
```

> **Common mistake:** joining text and numbers with `+`. `"Age: " + 30` is a `TypeError`. Use an f-string: `f"Age: {30}"`.
'"""

COLLECTIONS_BODY = r"""
Single variables aren't enough once you have many values. Python's two workhorse containers are **lists** (ordered sequences) and **dictionaries** (labelled values).

### Lists

```python
scores = [72, 88, 95, 60]

scores[0]        # 72
scores[-1]       # 60
scores[1:3]      # [88, 95]
len(scores)      # 4
```

Unlike strings, lists are **mutable**, so you can change them in place:

```python
scores.append(81)         # add to the end
scores.insert(0, 50)      # add at a position
scores.remove(60)         # remove the first matching value
last = scores.pop()       # remove and return the last item
scores[0] = 100           # replace an item
scores.sort()             # sort in place
```

Handy built-ins: `sum(scores)`, `min(scores)`, `max(scores)`, `sorted(scores)`, `len(scores)`.

```python
average = sum(scores) / len(scores)
```

### Two names, one list

Assigning a list does **not** copy it:

```python
a = [1, 2, 3]
b = a            # b is the same list, not a copy
b.append(4)
print(a)         # [1, 2, 3, 4]  <- a changed too

c = a.copy()     # a real, independent copy
```

This is the source of many confusing bugs.

### Dictionaries

A dictionary maps **keys** to **values**. Use it when items have meaningful labels:

```python
student = {"name": "Ada", "age": 36, "scores": [72, 88]}

student["name"]            # 'Ada'
student["age"] = 37        # update
student["city"] = "Lagos"  # add a new key
del student["city"]        # remove
"name" in student          # True (checks keys)
```

Reading a key that doesn't exist raises a `KeyError`. Use `.get()` to supply a fallback instead:

```python
student["email"]               # KeyError: 'email'
student.get("email")           # None
student.get("email", "n/a")    # 'n/a'
```

### Looping over a dictionary

```python
for key in student:                    # keys
    print(key)

for key, value in student.items():     # keys and values together
    print(f"{key}: {value}")
```

### Lists of dictionaries

Real datasets often look like this, and it's the shape you'll meet again as table rows:

```python
students = [
    {"name": "Ada", "score": 88},
    {"name": "Tunde", "score": 72},
]
print(students[0]["name"])    # Ada
```

### Tuples (a quick mention)

A tuple is an **immutable** list written with round brackets: `point = (3, 4)`. Use one for a fixed group of values such as coordinates or a (rows, columns) shape.

> **Why this matters for ML:** a dataset is, at heart, a list of rows, and a row is often a dictionary or a list of numbers. NumPy and pandas build on exactly these ideas.
"""

CONDITIONALS_BODY = r"""
Conditionals let your program choose what to do. The tool is `if`, with optional `elif` and `else`.

```python
score = 82

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(grade)    # B
```

Python checks the conditions **top to bottom** and runs only the first block that is true. That's why `score >= 90` comes before `score >= 80`. Reverse them and everyone with 90+ would get a B.

### Indentation is the syntax

The colon `:` opens a block, and the **4-space indent** says which lines belong to it. There are no curly braces.

```python
if score >= 70:
    print("pass")        # inside the if
    print("well done")   # inside the if
print("done")            # runs every time
```

### Truthiness

Any value can be used as a condition. These count as **False**: `False`, `None`, `0`, `0.0`, `""` (empty string), `[]` (empty list), `{}` (empty dict). Almost everything else is **True**.

```python
items = []
if items:
    print("has items")
else:
    print("empty")        # runs
```

### Chained comparisons

Python lets you write ranges the way you would in maths:

```python
if 0 <= probability <= 1:
    print("valid probability")
```

### Combining conditions

```python
if age >= 18 and has_id:
    print("entry allowed")

if role == "admin" or role == "editor":
    print("can edit")

if role in ("admin", "editor"):     # shorter equivalent
    print("can edit")
```

### Nested conditions and guard clauses

You can nest `if` blocks, but deep nesting gets hard to read. Handling the bad case early keeps code flat:

```python
def safe_divide(a, b):
    if b == 0:
        return None          # guard clause: deal with the problem first
    return a / b
```

### The ternary shortcut

```python
label = "pass" if score >= 70 else "fail"
```

> **Common mistakes:**
> 1. `if x = 5:` is a `SyntaxError`. Comparison needs `==`.
> 2. `if x == 1 or 2:` is always true. Write `if x == 1 or x == 2:` or `if x in (1, 2):`.
> 3. Comparing floats with `==`. Use `math.isclose`.
"""

LOOPS_BODY = r"""
A **loop** repeats code. Python has two kinds, and choosing the right one is half the skill.

### `for` loops: when you know what to loop over

```python
scores = [72, 88, 95]

for score in scores:
    print(score)
```

On each pass, `score` takes the next value. When the list runs out, the loop ends.

### `range()`: looping a number of times

```python
for i in range(3):          # 0, 1, 2
    print(i)

range(2, 6)                 # 2, 3, 4, 5
range(0, 10, 2)             # 0, 2, 4, 6, 8   (start, stop, step)
```

Like slicing, `range` **stops before** the end value.

### `enumerate()`: the item and its position

```python
for i, score in enumerate(scores):
    print(i, score)         # 0 72 / 1 88 / 2 95
```

Prefer this to `range(len(scores))`. It's cleaner and less error-prone.

### Looping over two lists together

```python
names = ["Ada", "Tunde"]
marks = [88, 72]
for name, mark in zip(names, marks):
    print(f"{name}: {mark}")
```

### Four patterns you'll write constantly

**1. Accumulator.** Build up a total:

```python
total = 0
for s in scores:
    total += s
```

**2. Counter.** Count items that match:

```python
passes = 0
for s in scores:
    if s >= 70:
        passes += 1
```

**3. Filter.** Collect the ones you want:

```python
high = []
for s in scores:
    if s >= 80:
        high.append(s)
```

**4. Find the best.** Track the largest so far:

```python
best = scores[0]
for s in scores:
    if s > best:
        best = s
```

Each pattern **starts with a variable set up before the loop**. That's the part beginners forget.

### `break` and `continue`

```python
for s in scores:
    if s < 0:
        continue      # skip this item, go to the next
    if s == 100:
        break         # stop the whole loop
```

### `while` loops: when you don't know how many times

```python
guess = 100
while guess > 1:
    guess = guess / 2
    print(guess)
```

`while` repeats as long as its condition is true. **Something inside the loop must eventually make the condition false**, or it runs forever. If that happens, press `Ctrl + C` to stop it.

```python
count = 3
while count > 0:
    print(count)
    count -= 1        # without this line: infinite loop
```

### Nested loops

A loop inside a loop runs the inner one fully for every outer pass:

```python
for row in range(2):
    for col in range(3):
        print(row, col)      # 6 lines in total
```

### Don't change a list while looping over it

Removing items from the list you're iterating skips elements. Build a new list instead:

```python
# risky
for s in scores:
    if s < 70:
        scores.remove(s)

# safe
scores = [s for s in scores if s >= 70]    # list comprehension
```

> **Why this matters for ML:** training is a loop. You repeat "predict, measure error, adjust" for many epochs. The accumulator and counter patterns are how you compute loss and accuracy.
"""

FUNCTIONS_BODY = r"""
A **function** is a named, reusable block of code. You write the logic once and call it as often as you like.

```python
def average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)

result = average([72, 88, 95])
print(result)       # 85.0
```

### Anatomy of a function

- `def` starts the definition.
- `average` is the name, in `snake_case` and ideally a verb or description.
- `numbers` is a **parameter**, a placeholder for input.
- The indented block is the **body**.
- `return` sends a value back and **ends the function immediately**.

The values you pass when calling (`[72, 88, 95]`) are called **arguments**.

### Print vs return

```python
def add_print(a, b):
    print(a + b)

def add_return(a, b):
    return a + b

x = add_print(2, 3)     # prints 5, but x is None
y = add_return(2, 3)    # y is 5
```

`print` only displays a value. `return` gives it back so other code can use it. **Most functions should return.** A function with no `return` gives back `None`.

### Default values and keyword arguments

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Ada")                       # 'Hello, Ada!'
greet("Ada", "Welcome")            # 'Welcome, Ada!'
greet(greeting="Hi", name="Ada")   # keyword arguments: order doesn't matter
```

Parameters with defaults must come **after** the ones without.

### Returning several values

```python
def min_max(values):
    return min(values), max(values)

low, high = min_max([4, 9, 2])    # unpacking a tuple
```

### Docstrings

A string on the first line of the body documents the function:

```python
def average(numbers):
    """'Return the mean of a non-empty list of numbers.'"""
    return sum(numbers) / len(numbers)
```

Use `help(average)` to see it.

### Functions calling functions

Break big problems into small functions that each do one thing:

```python
def clean(text):
    return text.strip().lower()

def is_valid_label(text):
    return clean(text) in ("cat", "dog")
```

### Test as you go

After writing a function, call it with a few inputs including an edge case (an empty list, zero, one item) and check the output matches what you expect.

> **Common mistakes:**
> 1. Defining a function but never **calling** it. Nothing happens until you write `average(...)`.
> 2. Forgetting `return` and wondering why you got `None`.
> 3. Putting `return` inside a loop so it exits after the first pass.

> **Why this matters for ML:** data loading, cleaning, training and evaluation will each be a function. That's what keeps a project testable.
"""

SCOPE_BODY = r"""
**Scope** is the part of your code where a name exists. Getting it wrong causes some of the most puzzling beginner errors.

### Local variables

Names created inside a function exist only while it runs:

```python
def double(n):
    result = n * 2
    return result

double(4)
print(result)     # NameError: name 'result' is not defined
```

`result` was local to `double`. Parameters are local too.

### Global variables

Names created outside any function are global. A function can **read** them:

```python
TAX_RATE = 0.075

def with_tax(price):
    return price * (1 + TAX_RATE)
```

But assigning to a global name inside a function creates a **new local** one instead:

```python
count = 0

def increment():
    count = count + 1     # UnboundLocalError

increment()
```

You can fix it with the `global` keyword, but the better fix is to pass values in and return them out:

```python
def increment(count):
    return count + 1

count = increment(count)
```

Functions that depend only on their inputs are easier to test, reuse and debug.

### The mutable default trap

Never use a list or dict as a default value. It's created once and shared between calls:

```python
def add_item(item, items=[]):     # bug
    items.append(item)
    return items

add_item("a")    # ['a']
add_item("b")    # ['a', 'b']   <- surprise
```

Use `None` and create a fresh list inside:

```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### Functions can change the lists you give them

Lists are passed by reference, so a function that modifies its argument changes the caller's list:

```python
def add_bonus(scores):
    for i in range(len(scores)):
        scores[i] += 5

marks = [60, 70]
add_bonus(marks)
print(marks)      # [65, 75]
```

Decide whether a function **modifies** its input or **returns a new value**, and make it do only one. Returning a new list is usually safer:

```python
def with_bonus(scores):
    return [s + 5 for s in scores]
```

### Guidelines for good functions

- **Do one thing**, and name it for that thing.
- **Take inputs as parameters, return outputs.** Avoid reading and writing globals.
- Keep them short enough to read without scrolling.
- Avoid printing inside calculation functions. Return the value and let the caller decide what to display.
"""

ERRORS_BODY = r"""
Errors are not failures. Python is telling you exactly what went wrong and where. Reading them well is the fastest way to improve as a programmer.

Here is a broken program:

```python
scores = [72, 88, 95]
total = 0
for score in scores:
    total = total + scor
print(total)
```

and what Python prints:

```text
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    total = total + scor
NameError: name 'scor' is not defined
```

### How to read a traceback

1. **Start at the bottom.** The last line has the **error type** (`NameError`) and a **message**.
2. **Find the line number** just above it. `line 4` is where Python gave up.
3. **Read that line of code.** The typo `scor` is right there.
4. **Fix one thing, then run it again.**

### Tracebacks through several functions

When errors happen inside functions, the traceback lists each call, **oldest at the top, the failing line at the bottom**:

```text
Traceback (most recent call last):
  File "main.py", line 9, in <module>
    print(average([]))
  File "main.py", line 3, in average
    return sum(numbers) / len(numbers)
ZeroDivisionError: division by zero
```

Read it as a chain: line 9 called `average`, and line 3 inside `average` divided by zero because the list was empty. The **bottom** frame is where it broke, but the **cause** may be higher up, in the code that passed in the bad value.

### The errors you'll see most

| Error | Typical cause | Example |
|-------|---------------|---------|
| `SyntaxError` | Python can't parse the code: missing `:`, bracket or quote | `if x > 3` |
| `IndentationError` | Inconsistent indentation | a line indented 3 spaces instead of 4 |
| `NameError` | Name doesn't exist: typo, or used before it's defined | `print(totl)` |
| `TypeError` | Wrong type for an operation or wrong argument count | `"a" + 1`, `len(5)` |
| `ValueError` | Right type, unacceptable value | `int("abc")` |
| `IndexError` | List position doesn't exist | `[1, 2][5]` |
| `KeyError` | Dictionary key missing | `d["email"]` |
| `AttributeError` | Object has no such method or attribute | `"abc".push("d")` |
| `ZeroDivisionError` | Dividing by 0 | `10 / 0` |
| `UnboundLocalError` | Assigned to a name inside a function before using it | the `count` example from scope |
| `FileNotFoundError` | Wrong path or file name | `open("data.cvs")` |

### SyntaxErrors point near the problem

For syntax errors Python shows a caret (`^`) under where it got confused. The real mistake is often on the **line before**, such as an unclosed bracket:

```python
total = (1 + 2
print(total)      # error reported here, caused by the missing )
```

### Handling errors on purpose

Sometimes you expect something might fail, such as user input. Use `try` and `except`:

```python
raw = input("Age: ")
try:
    age = int(raw)
except ValueError:
    print("Please type a whole number.")
    age = None
```

Catch **specific** errors (`ValueError`), not everything. A bare `except:` hides real bugs.

> **Tip:** copy the **last line** of the traceback into a search engine, without your own variable names. Somebody has hit it before.
"""

DEBUGGING_BODY = r"""
Reading the error tells you what broke. **Debugging** is the process of finding out why. A fixed routine beats guessing.

### A five-step workflow

1. **Reproduce it.** Make the bug happen every time with the same input. If you can't trigger it reliably, you can't tell when you've fixed it.
2. **Read the message.** Use the traceback skills from the last section.
3. **Isolate it.** Shrink the problem. Which function? Which line? Which input?
4. **Form one hypothesis and test it.** "I think `total` is a string." Check it, don't assume.
5. **Fix one thing and re-run.** If you change five things at once, you won't know which one mattered.

### Print debugging

The simplest tool is to look at what your variables actually contain:

```python
def average(numbers):
    total = 0
    for n in numbers:
        print(f"n={n!r}, total={total!r}")    # !r shows the exact type/quotes
        total += n
    return total / len(numbers)
```

`!r` is useful because `5` and `"5"` look identical when printed normally but behave very differently.

Other quick checks:

```python
print(type(value))
print(len(items))
print(items[:3])        # peek at the first few
```

### Work out what you expect first

Before running, write down what the output **should** be, using a tiny example you can calculate by hand:

```python
assert average([2, 4, 6]) == 4
```

`assert` stops with an `AssertionError` if the condition is false. It's a one-line test you can leave in your code.

### Bisect the problem

If you have 40 lines and don't know where it goes wrong, put a `print` in the middle. If the value is already wrong there, the bug is in the first half. Otherwise it's in the second. Repeat. You'll find it in a handful of steps.

### Make a minimal example

Delete everything that isn't needed to trigger the bug. Very often the bug becomes obvious when the code is down to 5 lines, and if not, you now have a perfect example to ask for help with.

### Common bug patterns to check first

- **Off-by-one:** `range(n)` stops at `n - 1`, and the last index is `len(x) - 1`.
- **Wrong type:** a number stored as a string (from `input` or a file).
- **Variable never updated** inside a loop, or reset inside it by mistake.
- **Function never returns**, so you're working with `None`.
- **Shared list:** two names pointing at the same list.
- **Stale state:** you edited the file but didn't save or re-run it.

### Asking for help well

Include: what you expected, what happened, the **full traceback**, and the smallest code that reproduces it. Say what you've already tried.

> **Mindset:** the computer is doing exactly what you wrote, not what you meant. Debugging is finding the gap between the two.

> **Why this matters for ML:** later errors will be about array shapes and data types, which are often just as confusing. The same workflow applies: reproduce, read, isolate, test one idea.
"""


# --------------------------------------------------------------------- labs

LAB1_INSTRUCTIONS = r"""
## Goal

The starter code should print the average of some scores, but it crashes. You'll fix it, then extend it using functions, loops, conditionals and a dictionary.

## Steps

1. **Run the code** and read the error from the bottom up. Which name does Python not recognise?
2. **Fix the bug** so it prints `Average: 78.75`.
3. **Write `highest(scores)`.** Use a loop and the "find the best" pattern. Don't use `max()`.
4. **Write `grade(score)`.** It returns `"A"` for 90+, `"B"` for 80-89, `"C"` for 70-79 and `"F"` below 70.
5. **Count the passes.** Loop through the scores and count how many are 70 or above. Print `Passed: 3 of 4`.
6. **Build a dictionary** that maps each student name to their grade, then loop over it and print lines like `Ada: B`.

## Expected output

```text
Average: 78.75
Highest: 95
Passed: 3 of 4
Ada: B
Tunde: C
Chioma: A
Emeka: F
```

## Stretch

Make `average` return `0` instead of crashing when the list is empty.
"""

LAB1_STARTER = r"""def average(scores):
    total = 0
    for score in scores:
        total = total + scor
    return total / len(scores)


names = ["Ada", "Tunde", "Chioma", "Emeka"]
scores = [88, 72, 95, 60]

print("Average:", average(scores))

# TODO: highest(scores)
# TODO: grade(score)
# TODO: count and print the passes
# TODO: build a dict of name -> grade and print each pair
"""

LAB1_SOLUTION = r"""def average(scores):
    if not scores:
        return 0
    total = 0
    for score in scores:
        total = total + score
    return total / len(scores)


def highest(scores):
    best = scores[0]
    for score in scores:
        if score > best:
            best = score
    return best


def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    return "F"


names = ["Ada", "Tunde", "Chioma", "Emeka"]
scores = [88, 72, 95, 60]

print("Average:", average(scores))
print("Highest:", highest(scores))

passes = 0
for score in scores:
    if score >= 70:
        passes += 1
print(f"Passed: {passes} of {len(scores)}")

grades = {}
for name, score in zip(names, scores):
    grades[name] = grade(score)

for name, letter in grades.items():
    print(f"{name}: {letter}")
"""

LAB2_INSTRUCTIONS = r"""
## Goal

Practise the debugging workflow on three broken programs. Each has a different kind of error.

## How it works

The starter file contains **Bug 1** active and Bugs 2 and 3 commented out. Fix one bug at a time:

1. Run the code and **read the error from the bottom up**.
2. Write down, in a comment, what the error means in your own words.
3. Fix it, run it, and confirm the expected output.
4. Then uncomment the next bug.

## Bug 1: expected output `Mean: 5.0`

A `SyntaxError`. Python can't even start the program.

## Bug 2: expected output `Price of banana: unknown`

A `KeyError`. The program must not crash when a key is missing. Use `.get()` with a fallback.

## Bug 3: expected output `Next year you will be 31`

A `TypeError`. `input()` returns text. For this lab, replace the `input` call with the fixed value `"30"` so it runs without typing.

## Reflection

After fixing all three, add a comment above each one naming the error type and which line of the traceback gave you the clue.
"""

LAB2_STARTER = r"""# ---- Bug 1 ----
def mean(values)
    return sum(values) / len(values)

print("Mean:", mean([2, 4, 9]))


# ---- Bug 2 (uncomment after fixing Bug 1) ----
# prices = {"apple": 1.2, "pear": 0.8}
# print("Price of banana:", prices["banana"])


# ---- Bug 3 (uncomment after fixing Bug 2) ----
# age = input("Age: ")
# print("Next year you will be", age + 1)
"""

LAB2_SOLUTION = r"""def mean(values):
    return sum(values) / len(values)

print("Mean:", mean([2, 4, 9]))


prices = {"apple": 1.2, "pear": 0.8}
print("Price of banana:", prices.get("banana", "unknown"))


age = "30"
print("Next year you will be", int(age) + 1)
"""


# --------------------------------------------------------------------- seed

def seed(db: Session) -> None:
    if not db.get(User, 1):
        db.add(User(id=1, name="Tito"))
        db.commit()
    if db.query(Module).first():
        return

    module = Module(slug="python-foundations", title="Python Foundations", order=1)

    lesson = Lesson(
        slug="python-basics",
        number="1.1",
        title="Python Basics: Variables, Loops, Functions & Errors",
        topic="Writing and debugging your first Python programs",
        duration_seconds=2700,
        order=1,
        content={
            "intro": (
                "Every machine learning project starts with plain Python. This lesson takes you "
                "from your first variable to debugging your own programs. You'll learn how data is "
                "stored, how to repeat and decide, how to package logic into functions, and, most "
                "importantly, how to read errors and fix them. Run every code sample yourself as "
                "you go: typing it out teaches more than reading it."
            ),
            "sections": [
                {
                    "slug": "variables",
                    "title": "Variables and data types",
                    "body": VARIABLES_BODY,
                    "key_components": [
                        {"term": "int", "description": "Whole numbers, like 36 or -4."},
                        {"term": "float", "description": "Decimal numbers, like 1.68."},
                        {"term": "str", "description": "Text, written inside quotes."},
                        {"term": "bool", "description": "True or False."},
                        {"term": "None", "description": "A placeholder meaning 'no value'."},
                    ],
                },
                {
                    "slug": "operators",
                    "title": "Operators and type conversion",
                    "body": OPERATORS_BODY,
                    "key_components": [
                        {"term": "/ vs //", "description": "/ gives a float (7 / 2 = 3.5); // floors the result (7 // 2 = 3)."},
                        {"term": "%", "description": "The remainder after division, useful for even/odd checks."},
                        {"term": "int() / float() / str()", "description": "Convert a value to another type."},
                        {"term": "math.isclose()", "description": "Compare floats safely instead of using ==."},
                    ],
                },
                {
                    "slug": "strings",
                    "title": "Working with strings",
                    "body": STRINGS_BODY,
                    "key_components": [
                        {"term": "slicing", "description": "text[start:stop] takes characters from start up to, not including, stop."},
                        {"term": "immutable", "description": "Strings can't be changed in place; methods return new strings."},
                        {"term": "f-string", "description": "f\"{value:.2f}\" embeds values and formats them."},
                    ],
                },
                {
                    "slug": "collections",
                    "title": "Lists and dictionaries",
                    "body": COLLECTIONS_BODY,
                    "key_components": [
                        {"term": "list", "description": "An ordered, changeable sequence: [1, 2, 3]."},
                        {"term": "dict", "description": "Key-value pairs: {\"name\": \"Ada\"}."},
                        {"term": ".get(key, default)", "description": "Reads a dictionary key without raising KeyError."},
                        {"term": ".copy()", "description": "Makes an independent copy so changes don't leak between names."},
                    ],
                },
                {
                    "slug": "conditionals",
                    "title": "Making decisions",
                    "body": CONDITIONALS_BODY,
                    "key_components": [
                        {"term": "if / elif / else", "description": "Runs the first block whose condition is true."},
                        {"term": "truthiness", "description": "0, '', [], {} and None count as False; most else is True."},
                        {"term": "== vs =", "description": "== compares values; = assigns a value."},
                    ],
                },
                {
                    "slug": "loops",
                    "title": "Loops",
                    "body": LOOPS_BODY,
                    "key_components": [
                        {"term": "for", "description": "Repeat once for each item in a sequence."},
                        {"term": "while", "description": "Repeat as long as a condition stays true."},
                        {"term": "range(n)", "description": "Produces the numbers 0 up to n - 1."},
                        {"term": "enumerate()", "description": "Gives both the position and the item."},
                        {"term": "break / continue", "description": "Stop the loop, or skip to the next item."},
                    ],
                },
                {
                    "slug": "functions",
                    "title": "Functions",
                    "body": FUNCTIONS_BODY,
                    "key_components": [
                        {"term": "def", "description": "Keyword that starts a function definition."},
                        {"term": "parameter vs argument", "description": "Parameters are the names in the definition; arguments are the values you pass in."},
                        {"term": "return", "description": "Sends a value back to the caller and ends the function."},
                        {"term": "default value", "description": "Used when the caller leaves the argument out."},
                    ],
                },
                {
                    "slug": "scope",
                    "title": "Scope and writing good functions",
                    "body": SCOPE_BODY,
                    "key_components": [
                        {"term": "local", "description": "A name created inside a function; it disappears when the function ends."},
                        {"term": "global", "description": "A name created outside any function."},
                        {"term": "mutable default", "description": "A list or dict as a default value is shared between calls; use None instead."},
                    ],
                },
                {
                    "slug": "reading-errors",
                    "title": "Reading error messages",
                    "body": ERRORS_BODY,
                    "key_components": [
                        {"term": "SyntaxError", "description": "Python can't parse your code, often a missing colon or bracket."},
                        {"term": "NameError", "description": "You used a name that hasn't been defined, often a typo."},
                        {"term": "TypeError", "description": "An operation got the wrong type, like adding a string to a number."},
                        {"term": "ValueError", "description": "The right type but an unusable value, like int('abc')."},
                        {"term": "IndexError / KeyError", "description": "A list position or dictionary key that doesn't exist."},
                        {"term": "try / except", "description": "Handle an expected error without crashing."},
                    ],
                },
                {
                    "slug": "debugging",
                    "title": "A debugging workflow",
                    "body": DEBUGGING_BODY,
                    "key_components": [
                        {"term": "reproduce", "description": "Make the bug happen on demand before changing anything."},
                        {"term": "isolate", "description": "Shrink the problem to the smallest failing example."},
                        {"term": "print debugging", "description": "Print variables (use !r) to see their real values and types."},
                        {"term": "assert", "description": "A one-line check that stops the program if it's false."},
                    ],
                },
            ],
            "closing": (
                "You now have the foundation for everything that follows. Work through the two labs "
                "(the first builds a small score calculator; the second is pure debugging practice), "
                "then take the quiz."
            ),
            "badges": ["Variables", "Strings", "Lists & dicts", "Conditionals", "Loops", "Functions", "Tracebacks", "Debugging"],
        },
        quizzes=[
            Quiz(
                slug="python-basics-quiz",
                title="Python Basics Check",
                pass_ratio=0.8,
                order=1,
                questions=[
                    QuizQuestion(
                        prompt="What does `type(3.14)` return?",
                        options=["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"],
                        answer_index=1,
                        order=1,
                    ),
                    QuizQuestion(
                        prompt="What is the value of `17 // 5` and `17 % 5`?",
                        options=["3 and 2", "3.4 and 2", "2 and 3", "3 and 3"],
                        answer_index=0,
                        order=2,
                    ),
                    QuizQuestion(
                        prompt="What does this print?\n\nword = 'python'\nprint(word[1:4])",
                        options=["pyt", "yth", "ytho", "tho"],
                        answer_index=1,
                        order=3,
                    ),
                    QuizQuestion(
                        prompt="You run `student = {'name': 'Ada'}` then `student['email']`. What happens?",
                        options=[
                            "It returns None",
                            "It returns an empty string",
                            "It raises a KeyError",
                            "It adds the key automatically",
                        ],
                        answer_index=2,
                        order=4,
                    ),
                    QuizQuestion(
                        prompt="After `a = [1, 2, 3]`, `b = a`, `b.append(4)`, what is `a`?",
                        options=["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "An error"],
                        answer_index=1,
                        order=5,
                    ),
                    QuizQuestion(
                        prompt="Which condition is always true, regardless of `x`?",
                        options=["x == 1 or x == 2", "x == 1 or 2", "x in (1, 2)", "x == 1 and x == 2"],
                        answer_index=1,
                        order=6,
                    ),
                    QuizQuestion(
                        prompt="How many times does this loop print?\n\nfor i in range(4):\n    print(i)",
                        options=["3", "4", "5", "It runs forever"],
                        answer_index=1,
                        order=7,
                    ),
                    QuizQuestion(
                        prompt="What is the difference between `print()` and `return` inside a function?",
                        options=[
                            "They are identical",
                            "print shows a value on screen; return gives the value back to the caller",
                            "return shows a value on screen; print gives the value back to the caller",
                            "print can only be used outside functions",
                        ],
                        answer_index=1,
                        order=8,
                    ),
                    QuizQuestion(
                        prompt="A function has no `return` statement. What does calling it give back?",
                        options=["0", "An empty string", "None", "An error"],
                        answer_index=2,
                        order=9,
                    ),
                    QuizQuestion(
                        prompt="Which part of a traceback should you read first, and why?",
                        options=[
                            "The first line, because it's the start of the problem",
                            "The file name, because it names the bug",
                            "The last line, because it holds the error type and message",
                            "The longest line, because it has the most detail",
                        ],
                        answer_index=2,
                        order=10,
                    ),
                ],
            )
        ],
        labs=[Lab(order=i, **spec) for i, spec in enumerate(LAB_SPECS, start=1)],
    )

    module.lessons.append(lesson)
    db.add(module)
    db.commit()