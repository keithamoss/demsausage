from setuptools import setup, find_packages

setup(
    author="Keith Moss",
    author_email="keithamoss@gmail.com",
    description="Democracy Sausage",
    license="GPL3",
    keywords="",
    url="https://github.com/keithamoss/demsausage-v3",
    name="demsausage",
    version="0.1.0",
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
)
