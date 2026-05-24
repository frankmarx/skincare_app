import functools
import traceback
import sys

def handle_errors(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            # Log to console in the requested format
            print(f"ERROR: [{ { 'error': str(e) } }, 500]")
            # Also print full traceback for debugging
            traceback.print_exc()
            # Return the error in the format the client expects
            return { 'error': str(e) }, 500
    return wrapper
