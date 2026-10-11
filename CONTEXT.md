# Flash Cards

A vocabulary-learning app. Each user studies words in one learn language and reads translations in their native language. A shared catalog of words, translations and examples is reused by all users.

## Language

### Languages

**Learn language**:
The language the user studies. Catalog words are written in it.
_Avoid_: Target language, foreign language

**Native language**:
The language in which the user reads translations and which they type in when they know the meaning but not the learn-language word.
_Avoid_: Own language, source language, mother tongue

### Catalog

**Catalog word**:
A word or short phrase in a learn language, shared by all users, together with its translations and examples.
_Avoid_: Lemma, headword, base word

**Translation**:
A rendering of a catalog word in a native language.
_Avoid_: Gloss, meaning

**Example**:
A sentence in the learn language that contains a catalog word, paired with its sentence in the native language.
_Avoid_: Phrase, fraza

### Adding words

**Forward lookup**:
Adding a word the user typed in the learn language: the catalog word is the input, the translation comes from a remote service.
_Avoid_: Direct search

**Reverse lookup**:
Adding a word the user typed in the native language: a remote service supplies the catalog word, and the input becomes its translation.
_Avoid_: Back search, native search
