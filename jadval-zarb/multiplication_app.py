import random
import tkinter as tk

def generate_numbers(prev_n1 = 0, prev_n2 = 0):
    n1 = random.randint(2, 12)
    n2 = random.randint(2, 12) if n1 <= 10 else random.randint(2, 10)
    if n1 == prev_n1 and n2 == prev_n2:
        return generate_numbers(prev_n1, prev_n2)
    return n1, n2

def make_number_farsi(number : int):
    return str(number).replace("1", "۱").replace("2", "۲").replace("3", "۳").replace("4", "۴").replace("5", "۵").replace("6", "۶").replace("7", "۷").replace("8", "۸").replace("9", "۹").replace("0", "۰")

def make_number_english(number : str):
    return int(number.replace("۱", "1").replace("۲", "2").replace("۳", "3").replace("۴", "4").replace("۵", "5").replace("۶", "6").replace("۷", "7").replace("۸", "8").replace("۹", "9").replace("۰", "0"))

def check_answer():
    if not hasattr(check_answer, "mistake_count"):
        check_answer.mistake_count = 0

    try:
        user_answer = make_number_english(answer_entry.get())
        correct_answer = num1 * num2
        if user_answer == correct_answer:
            result_label.config(text="درسته!", fg="green")
            check_answer.mistake_count = 0
            new_question()
        else:
            check_answer.mistake_count += 1
            if check_answer.mistake_count >= 3:
                result_label.config(text=f"اشتباه! جواب درست {make_number_farsi(correct_answer)} است.", fg="red")
                check_answer.mistake_count = 0
                root.after(3000, new_question)  # Show the correct answer for 3 seconds before generating a new question
            else:
                result_label.config(text="اشتباه! دوباره امتحان کن.", fg="red")
    except ValueError:
        result_label.config(text="واقعا که", fg="red")

def new_question():
    global num1, num2
    num1, num2 = generate_numbers(num1, num2)
    question_label.config(text=f"{make_number_farsi(num1)} ضرب در {make_number_farsi(num2)}؟")
    answer_entry.delete(0, tk.END)
    result_label.config(text="")

def on_enter(event):
    check_answer()

# Initialize the main window
root = tk.Tk()
root.title("Multiplication Quiz")
root.geometry("500x300")  # Set the window size

# Set colors
root.configure(bg="#E0F7FA")
question_label_color = "#D32F2F"
button_color = "#0288D1"
button_text_color = "#000000"  # Set unfocused text color to black
button_active_color = "#0277BD"
button_active_text_color = "#ffffff"  # Set focused text color to white

# Generate the first question
num1, num2 = generate_numbers()

# Create and place widgets
question_label = tk.Label(root, text=f"{make_number_farsi(num1)} ضرب‌ در {make_number_farsi(num2)}؟", bg="#E0F7FA", fg=question_label_color, font=("Helvetica", 24, "bold"))
question_label.pack(pady=20)

answer_entry = tk.Entry(root, font=("Helvetica", 16))
answer_entry.pack(pady=10)
answer_entry.bind("<Return>", on_enter)  # Bind the Enter key to the check_answer function

submit_button = tk.Button(root, text="چک کن", command=check_answer, bg=button_color, fg=button_text_color, activebackground=button_active_color, activeforeground=button_active_text_color, font=("Helvetica", 16))
submit_button.pack(pady=5)

new_question_button = tk.Button(root, text="سوال جدید", command=new_question, bg=button_color, fg=button_text_color, activebackground=button_active_color, activeforeground=button_active_text_color, font=("Helvetica", 16))
new_question_button.pack(pady=5)

result_label = tk.Label(root, text="", bg="#E0F7FA", font=("Helvetica", 16))
result_label.pack(pady=10)

# Start the main event loop
root.mainloop()
