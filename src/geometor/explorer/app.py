"""
run the main app
"""
from .explorer import Explorer


def run() -> None:
    reply = Explorer().run()
    print(reply)
