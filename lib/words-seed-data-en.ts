// Определяем PartOfSpeech локально, так как импорт из Prisma может не работать во время выполнения seed
export enum PartOfSpeech {
  NOUN = 'NOUN',
  VERB = 'VERB',
  ADJECTIVE = 'ADJECTIVE',
  ADVERB = 'ADVERB',
  PRONOUN = 'PRONOUN',
  PREPOSITION = 'PREPOSITION',
  CONJUNCTION = 'CONJUNCTION',
  INTERJECTION = 'INTERJECTION'
}

export enum SentenceTypeCode {
  AFFIRMATIVE = 'AFFIRMATIVE',
  NEGATIVE = 'NEGATIVE',
  QUESTION = 'QUESTION',
  NEGATIVE_QUESTION = 'NEGATIVE_QUESTION'
}

export interface WordData {
  word: string
  partOfSpeech: PartOfSpeech
  languageCode: string
  translations: {
    languageCode: string
    translations: string[] // до 3 переводов
  }[]
  examples: {
    pronoun: string
    example: string
    translation: string
    sentenceTypeCode?: SentenceTypeCode
    isNegative?: boolean
    isQuestion?: boolean
  }[]
  grammaticalExamples: {
    tenseName: string
    examples: {
      pronoun: string
      example: string
      translation: string
      sentenceTypeCode?: SentenceTypeCode
      isNegative?: boolean
      isQuestion?: boolean
    }[]
  }[]
}

// Данные слов для английского языка - 30 самых популярных глаголов
export const ENGLISH_WORDS_DATA: WordData[] = [
  // 1. BE
  {
    word: 'be',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['быть', 'являться', 'находиться']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I am a software engineer', translation: 'Я программист' },
          { pronoun: 'you', example: 'You are very talented', translation: 'Ты очень талантлив' },
          { pronoun: 'he', example: 'He is my best friend', translation: 'Он мой лучший друг' },
          { pronoun: 'she', example: 'She is at the office', translation: 'Она в офисе' },
          { pronoun: 'we', example: 'We are ready for the meeting', translation: 'Мы готовы к встрече' },
          { pronoun: 'they', example: 'They are from New York', translation: 'Они из Нью-Йорка' },
          { pronoun: 'I', example: 'I am not tired today', translation: 'Я не устал сегодня', isNegative: true },
          { pronoun: 'you', example: 'Are you ready for the exam?', translation: 'Ты готов к экзамену?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I was at the conference yesterday', translation: 'Я был на конференции вчера' },
          { pronoun: 'you', example: 'You were absolutely right about that', translation: 'Ты был абсолютно прав насчет этого' },
          { pronoun: 'he', example: 'He was very happy with the results', translation: 'Он был очень доволен результатами' },
          { pronoun: 'we', example: 'We were in Paris last summer', translation: 'Мы были в Париже прошлым летом' },
          { pronoun: 'they', example: 'They were at the party', translation: 'Они были на вечеринке' },
          { pronoun: 'I', example: 'I was not feeling well yesterday', translation: 'Я плохо себя чувствовал вчера', isNegative: true },
          { pronoun: 'you', example: 'Were you at home last night?', translation: 'Ты был дома вчера вечером?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will be there in five minutes', translation: 'Я буду там через пять минут' },
          { pronoun: 'you', example: 'You will be a great doctor', translation: 'Ты будешь отличным врачом' },
          { pronoun: 'he', example: 'He will be here tomorrow morning', translation: 'Он будет здесь завтра утром' },
          { pronoun: 'we', example: 'We will be waiting for you', translation: 'Мы будем ждать тебя' },
          { pronoun: 'they', example: 'They will be very surprised', translation: 'Они будут очень удивлены' },
          { pronoun: 'I', example: 'I will not be late again', translation: 'Я больше не опоздаю', isNegative: true },
          { pronoun: 'you', example: 'Will you be at the meeting?', translation: 'Ты будешь на встрече?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have been to London twice', translation: 'Я был в Лондоне дважды' },
          { pronoun: 'you', example: 'You have been so helpful lately', translation: 'Ты был так полезен в последнее время' },
          { pronoun: 'he', example: 'He has been sick all week', translation: 'Он болеет всю неделю' },
          { pronoun: 'we', example: 'We have been friends for years', translation: 'Мы друзья уже много лет' },
          { pronoun: 'they', example: 'They have been very patient', translation: 'Они были очень терпеливы' },
          { pronoun: 'I', example: 'I have not been to that restaurant', translation: 'Я не был в том ресторане', isNegative: true },
          { pronoun: 'you', example: 'Have you ever been to Japan?', translation: 'Ты когда-нибудь был в Японии?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am being very careful with this', translation: 'Я очень осторожен с этим' },
          { pronoun: 'you', example: 'You are being too loud', translation: 'Ты ведешь себя слишком громко' },
          { pronoun: 'he', example: 'He is being really nice today', translation: 'Он сегодня очень мил' },
          { pronoun: 'we', example: 'We are being as honest as possible', translation: 'Мы максимально честны' },
          { pronoun: 'they', example: 'They are being very helpful', translation: 'Они очень помогают' },
          { pronoun: 'I', example: 'I am not being difficult', translation: 'Я не веду себя трудно', isNegative: true },
          { pronoun: 'you', example: 'Are you being serious right now?', translation: 'Ты сейчас серьезно?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to be a doctor', translation: 'Я стану доктором' },
          { pronoun: 'you', example: 'You are going to be late', translation: 'Ты опоздаешь' },
          { pronoun: 'he', example: 'He is going to be successful', translation: 'Он будет успешным' },
          { pronoun: 'we', example: 'We are going to be there soon', translation: 'Мы скоро будем там' },
          { pronoun: 'they', example: 'They are going to be happy', translation: 'Они будут счастливы' },
          { pronoun: 'I', example: 'I am not going to be available', translation: 'Я не буду доступен', isNegative: true },
          { pronoun: 'you', example: 'Are you going to be okay?', translation: 'С тобой все будет в порядке?', isQuestion: true }
        ]
      }
    ]
  },
  
  // 2. HAVE
  {
    word: 'have',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['иметь', 'обладать', 'владеть']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I have two brothers and one sister', translation: 'У меня два брата и одна сестра' },
          { pronoun: 'you', example: 'You have a beautiful smile', translation: 'У тебя красивая улыбка' },
          { pronoun: 'he', example: 'He has a nice apartment downtown', translation: 'У него хорошая квартира в центре' },
          { pronoun: 'she', example: 'She has many interesting hobbies', translation: 'У нее много интересных хобби' },
          { pronoun: 'we', example: 'We have some important news', translation: 'У нас есть важные новости' },
          { pronoun: 'they', example: 'They have three dogs and two cats', translation: 'У них три собаки и две кошки' },
          { pronoun: 'I', example: 'I do not have any money left', translation: 'У меня не осталось денег', isNegative: true },
          { pronoun: 'you', example: 'Do you have a minute to talk?', translation: 'У тебя есть минута поговорить?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I had a wonderful time at the party', translation: 'Я чудесно провел время на вечеринке' },
          { pronoun: 'you', example: 'You had a great opportunity there', translation: 'У тебя была отличная возможность там' },
          { pronoun: 'he', example: 'He had some trouble with his car', translation: 'У него были проблемы с машиной' },
          { pronoun: 'we', example: 'We had dinner at that restaurant', translation: 'Мы ужинали в том ресторане' },
          { pronoun: 'they', example: 'They had a long meeting yesterday', translation: 'У них была долгая встреча вчера' },
          { pronoun: 'I', example: 'I did not have enough time', translation: 'У меня не было достаточно времени', isNegative: true },
          { pronoun: 'you', example: 'Did you have a good vacation?', translation: 'У тебя был хороший отпуск?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will have my own business', translation: 'У меня будет свой бизнес' },
          { pronoun: 'you', example: 'You will have plenty of opportunities', translation: 'У тебя будет много возможностей' },
          { pronoun: 'he', example: 'He will have a big birthday party', translation: 'У него будет большой день рождения' },
          { pronoun: 'we', example: 'We will have a new office space', translation: 'У нас будет новый офис' },
          { pronoun: 'they', example: 'They will have more free time', translation: 'У них будет больше свободного времени' },
          { pronoun: 'I', example: 'I will not have time for that', translation: 'У меня не будет времени на это', isNegative: true },
          { pronoun: 'you', example: 'Will you have dinner with us?', translation: 'Ты поужинаешь с нами?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have had this phone for three years', translation: 'У меня этот телефон три года' },
          { pronoun: 'you', example: 'You have had enough chances already', translation: 'У тебя уже было достаточно шансов' },
          { pronoun: 'he', example: 'He has had a difficult day', translation: 'У него был трудный день' },
          { pronoun: 'we', example: 'We have had several meetings about this', translation: 'У нас было несколько встреч по этому поводу' },
          { pronoun: 'they', example: 'They have had great success lately', translation: 'У них был большой успех в последнее время' },
          { pronoun: 'I', example: 'I have not had breakfast yet', translation: 'Я еще не завтракал', isNegative: true },
          { pronoun: 'you', example: 'Have you had lunch already?', translation: 'Ты уже обедал?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am having a great time here', translation: 'Я отлично провожу время здесь' },
          { pronoun: 'you', example: 'You are having second thoughts about it', translation: 'Ты сомневаешься насчет этого' },
          { pronoun: 'he', example: 'He is having lunch with his colleagues', translation: 'Он обедает со своими коллегами' },
          { pronoun: 'we', example: 'We are having a party this Saturday', translation: 'У нас вечеринка в эту субботу' },
          { pronoun: 'they', example: 'They are having some technical issues', translation: 'У них какие-то технические проблемы' },
          { pronoun: 'I', example: 'I am not having any problems', translation: 'У меня нет никаких проблем', isNegative: true },
          { pronoun: 'you', example: 'Are you having fun at the event?', translation: 'Ты веселишься на мероприятии?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to have a baby', translation: 'У меня будет ребенок' },
          { pronoun: 'you', example: 'You are going to have a great time', translation: 'Ты отлично проведешь время' },
          { pronoun: 'he', example: 'He is going to have surgery', translation: 'Ему предстоит операция' },
          { pronoun: 'we', example: 'We are going to have guests tonight', translation: 'У нас будут гости сегодня вечером' },
          { pronoun: 'they', example: 'They are going to have a meeting', translation: 'У них будет встреча' },
          { pronoun: 'I', example: 'I am not going to have any regrets', translation: 'У меня не будет никаких сожалений', isNegative: true },
          { pronoun: 'you', example: 'Are you going to have coffee?', translation: 'Ты будешь пить кофе?', isQuestion: true }
        ]
      }
    ]
  },

  // 3. DO
  {
    word: 'do',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['делать', 'выполнять', 'совершать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I do my homework every evening', translation: 'Я делаю домашнюю работу каждый вечер' },
          { pronoun: 'you', example: 'You do a fantastic job here', translation: 'Ты отлично работаешь здесь' },
          { pronoun: 'he', example: 'He does yoga three times a week', translation: 'Он занимается йогой три раза в неделю' },
          { pronoun: 'she', example: 'She does volunteer work on weekends', translation: 'Она занимается волонтерской работой по выходным' },
          { pronoun: 'we', example: 'We do our best to help people', translation: 'Мы делаем все возможное, чтобы помочь людям' },
          { pronoun: 'they', example: 'They do business around the world', translation: 'Они ведут бизнес по всему миру' },
          { pronoun: 'I', example: 'I do not like waking up early', translation: 'Я не люблю просыпаться рано', isNegative: true },
          { pronoun: 'you', example: 'Do you understand what I mean?', translation: 'Ты понимаешь, что я имею в виду?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I did all the tasks on time', translation: 'Я выполнил все задачи вовремя' },
          { pronoun: 'you', example: 'You did an amazing job on the project', translation: 'Ты проделал потрясающую работу над проектом' },
          { pronoun: 'he', example: 'He did his military service last year', translation: 'Он проходил военную службу в прошлом году' },
          { pronoun: 'we', example: 'We did everything we could', translation: 'Мы сделали все, что могли' },
          { pronoun: 'they', example: 'They did a lot of research', translation: 'Они провели много исследований' },
          { pronoun: 'I', example: 'I did not see that coming', translation: 'Я этого не ожидал', isNegative: true },
          { pronoun: 'you', example: 'Did you finish your work?', translation: 'Ты закончил свою работу?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will do it first thing tomorrow', translation: 'Я сделаю это первым делом завтра' },
          { pronoun: 'you', example: 'You will do great on the exam', translation: 'Ты отлично сдашь экзамен' },
          { pronoun: 'he', example: 'He will do the presentation next week', translation: 'Он сделает презентацию на следующей неделе' },
          { pronoun: 'we', example: 'We will do our research properly', translation: 'Мы проведем наше исследование должным образом' },
          { pronoun: 'they', example: 'They will do whatever it takes', translation: 'Они сделают все необходимое' },
          { pronoun: 'I', example: 'I will not do that again', translation: 'Я больше не буду этого делать', isNegative: true },
          { pronoun: 'you', example: 'Will you do me a favor?', translation: 'Ты окажешь мне услугу?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have done my part of the work', translation: 'Я сделал свою часть работы' },
          { pronoun: 'you', example: 'You have done so much for me', translation: 'Ты так много сделал для меня' },
          { pronoun: 'he', example: 'He has done his best to help', translation: 'Он сделал все возможное, чтобы помочь' },
          { pronoun: 'we', example: 'We have done this many times before', translation: 'Мы делали это много раз раньше' },
          { pronoun: 'they', example: 'They have done a wonderful job', translation: 'Они проделали замечательную работу' },
          { pronoun: 'I', example: 'I have not done anything wrong', translation: 'Я не сделал ничего плохого', isNegative: true },
          { pronoun: 'you', example: 'Have you done your homework yet?', translation: 'Ты уже сделал домашнее задание?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am doing my best right now', translation: 'Я делаю все возможное прямо сейчас' },
          { pronoun: 'you', example: 'You are doing everything perfectly', translation: 'Ты делаешь все идеально' },
          { pronoun: 'he', example: 'He is doing research for his thesis', translation: 'Он проводит исследование для своей диссертации' },
          { pronoun: 'we', example: 'We are doing a major renovation', translation: 'Мы делаем крупный ремонт' },
          { pronoun: 'they', example: 'They are doing important work here', translation: 'Они делают важную работу здесь' },
          { pronoun: 'I', example: 'I am not doing that anymore', translation: 'Я больше этого не делаю', isNegative: true },
          { pronoun: 'you', example: 'What are you doing this weekend?', translation: 'Что ты делаешь в эти выходные?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to do my laundry', translation: 'Я собираюсь постирать' },
          { pronoun: 'you', example: 'You are going to do something great', translation: 'Ты собираешься сделать что-то великое' },
          { pronoun: 'he', example: 'He is going to do the shopping', translation: 'Он собирается сходить за покупками' },
          { pronoun: 'we', example: 'We are going to do it together', translation: 'Мы собираемся сделать это вместе' },
          { pronoun: 'they', example: 'They are going to do a performance', translation: 'Они собираются дать выступление' },
          { pronoun: 'I', example: 'I am not going to do it alone', translation: 'Я не собираюсь делать это один', isNegative: true },
          { pronoun: 'you', example: 'Are you going to do it yourself?', translation: 'Ты собираешься сделать это сам?', isQuestion: true }
        ]
      }
    ]
  },

  // 4. SAY
  {
    word: 'say',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['говорить', 'сказать', 'произносить']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I say what I really think', translation: 'Я говорю то, что на самом деле думаю' },
          { pronoun: 'you', example: 'You say the funniest things', translation: 'Ты говоришь самые смешные вещи' },
          { pronoun: 'he', example: 'He says hello to everyone he meets', translation: 'Он здоровается со всеми, кого встречает' },
          { pronoun: 'she', example: 'She says her prayers every night', translation: 'Она молится каждый вечер' },
          { pronoun: 'we', example: 'We say grace before every meal', translation: 'Мы молимся перед каждой едой' },
          { pronoun: 'they', example: 'They say the weather will improve', translation: 'Они говорят, погода улучшится' },
          { pronoun: 'I', example: 'I do not say things I regret', translation: 'Я не говорю того, о чем сожалею', isNegative: true },
          { pronoun: 'you', example: 'What do you say about his proposal?', translation: 'Что ты скажешь о его предложении?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I said something I really regret', translation: 'Я сказал то, о чем очень сожалею' },
          { pronoun: 'you', example: 'You said you would help me', translation: 'Ты сказал, что поможешь мне' },
          { pronoun: 'he', example: 'He said nothing about the incident', translation: 'Он ничего не сказал об инциденте' },
          { pronoun: 'we', example: 'We said goodbye at the airport', translation: 'Мы попрощались в аэропорту' },
          { pronoun: 'they', example: 'They said the meeting was cancelled', translation: 'Они сказали, что встреча отменена' },
          { pronoun: 'I', example: 'I did not say anything rude', translation: 'Я не сказал ничего грубого', isNegative: true },
          { pronoun: 'you', example: 'Did you say something to him?', translation: 'Ты что-то сказал ему?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will say a few words', translation: 'Я скажу несколько слов' },
          { pronoun: 'you', example: 'You will say what you really feel', translation: 'Ты скажешь то, что на самом деле чувствуешь' },
          { pronoun: 'he', example: 'He will say sorry when ready', translation: 'Он извинится, когда будет готов' },
          { pronoun: 'we', example: 'We will say our final goodbyes', translation: 'Мы скажем наши последние прощания' },
          { pronoun: 'they', example: 'They will say yes to the offer', translation: 'Они скажут да на предложение' },
          { pronoun: 'I', example: 'I will not say a word', translation: 'Я не скажу ни слова', isNegative: true },
          { pronoun: 'you', example: 'Will you say something at the meeting?', translation: 'Ты скажешь что-нибудь на встрече?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have said everything I needed', translation: 'Я сказал все, что нужно было' },
          { pronoun: 'you', example: 'You have said that many times', translation: 'Ты говорил это много раз' },
          { pronoun: 'he', example: 'He has said some harsh words', translation: 'Он сказал несколько резких слов' },
          { pronoun: 'we', example: 'We have said our piece already', translation: 'Мы уже высказались' },
          { pronoun: 'they', example: 'They have said wonderful things about you', translation: 'Они говорили замечательные вещи о тебе' },
          { pronoun: 'I', example: 'I have not said my final word', translation: 'Я не сказал своего последнего слова', isNegative: true },
          { pronoun: 'you', example: 'Have you said thank you yet?', translation: 'Ты уже поблагодарил?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am saying this for your benefit', translation: 'Я говорю это для твоей пользы' },
          { pronoun: 'you', example: 'You are saying exactly what I think', translation: 'Ты говоришь именно то, что я думаю' },
          { pronoun: 'he', example: 'He is saying goodbye to everyone', translation: 'Он прощается со всеми' },
          { pronoun: 'we', example: 'We are saying our prayers together', translation: 'Мы вместе молимся' },
          { pronoun: 'they', example: 'They are saying very positive things', translation: 'Они говорят очень позитивные вещи' },
          { pronoun: 'I', example: 'I am not saying you are wrong', translation: 'Я не говорю, что ты неправ', isNegative: true },
          { pronoun: 'you', example: 'What are you saying to me?', translation: 'Что ты мне говоришь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to say yes', translation: 'Я собираюсь сказать да' },
          { pronoun: 'you', example: 'You are going to say no', translation: 'Ты собираешься сказать нет' },
          { pronoun: 'he', example: 'He is going to say something important', translation: 'Он собирается сказать что-то важное' },
          { pronoun: 'we', example: 'We are going to say our vows', translation: 'Мы собираемся произнести наши клятвы' },
          { pronoun: 'they', example: 'They are going to say their opinion', translation: 'Они собираются высказать свое мнение' },
          { pronoun: 'I', example: 'I am not going to say anything', translation: 'Я не собираюсь ничего говорить', isNegative: true },
          { pronoun: 'you', example: 'Are you going to say yes?', translation: 'Ты собираешься сказать да?', isQuestion: true }
        ]
      }
    ]
  },

  // 5. GET
  {
    word: 'get',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['получать', 'добираться', 'становиться']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I get up at seven every morning', translation: 'Я встаю в семь каждое утро' },
          { pronoun: 'you', example: 'You get excellent results every time', translation: 'Ты получаешь отличные результаты каждый раз' },
          { pronoun: 'he', example: 'He gets nervous before important meetings', translation: 'Он нервничает перед важными встречами' },
          { pronoun: 'she', example: 'She gets lots of compliments', translation: 'Она получает много комплиментов' },
          { pronoun: 'we', example: 'We get our groceries delivered', translation: 'Мы получаем продукты с доставкой' },
          { pronoun: 'they', example: 'They get paid twice a month', translation: 'Им платят дважды в месяц' },
          { pronoun: 'I', example: 'I do not get angry easily', translation: 'Я не злюсь легко', isNegative: true },
          { pronoun: 'you', example: 'Do you get my point now?', translation: 'Ты теперь понимаешь мою точку зрения?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I got a promotion last month', translation: 'Я получил повышение в прошлом месяце' },
          { pronoun: 'you', example: 'You got the best score', translation: 'Ты получил лучший результат' },
          { pronoun: 'he', example: 'He got married last summer', translation: 'Он женился прошлым летом' },
          { pronoun: 'we', example: 'We got stuck in traffic', translation: 'Мы застряли в пробке' },
          { pronoun: 'they', example: 'They got amazing news yesterday', translation: 'Они получили потрясающие новости вчера' },
          { pronoun: 'I', example: 'I did not get your message', translation: 'Я не получил твое сообщение', isNegative: true },
          { pronoun: 'you', example: 'Did you get my email?', translation: 'Ты получил мое письмо?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will get my degree next year', translation: 'Я получу свою степень в следующем году' },
          { pronoun: 'you', example: 'You will get better with practice', translation: 'Ты станешь лучше с практикой' },
          { pronoun: 'he', example: 'He will get the job offer', translation: 'Он получит предложение о работе' },
          { pronoun: 'we', example: 'We will get there on time', translation: 'Мы доберемся туда вовремя' },
          { pronoun: 'they', example: 'They will get their reward soon', translation: 'Они скоро получат свою награду' },
          { pronoun: 'I', example: 'I will not get in your way', translation: 'Я не буду тебе мешать', isNegative: true },
          { pronoun: 'you', example: 'Will you get here by noon?', translation: 'Ты доберешься сюда к полудню?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have gotten much better at this', translation: 'Я стал намного лучше в этом' },
          { pronoun: 'you', example: 'You have gotten so many opportunities', translation: 'Ты получил так много возможностей' },
          { pronoun: 'he', example: 'He has gotten into a good university', translation: 'Он поступил в хороший университет' },
          { pronoun: 'we', example: 'We have gotten all we need', translation: 'Мы получили все, что нам нужно' },
          { pronoun: 'they', example: 'They have gotten very good feedback', translation: 'Они получили очень хорошие отзывы' },
          { pronoun: 'I', example: 'I have not gotten any response yet', translation: 'Я еще не получил никакого ответа', isNegative: true },
          { pronoun: 'you', example: 'Have you gotten the results yet?', translation: 'Ты уже получил результаты?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am getting ready for work', translation: 'Я готовлюсь к работе' },
          { pronoun: 'you', example: 'You are getting better every day', translation: 'Ты становишься лучше каждый день' },
          { pronoun: 'he', example: 'He is getting tired of waiting', translation: 'Он устает ждать' },
          { pronoun: 'we', example: 'We are getting close to the finish', translation: 'Мы приближаемся к финишу' },
          { pronoun: 'they', example: 'They are getting more experience now', translation: 'Они набираются опыта сейчас' },
          { pronoun: 'I', example: 'I am not getting any younger', translation: 'Я не молодею', isNegative: true },
          { pronoun: 'you', example: 'Are you getting cold feet?', translation: 'Ты начинаешь трусить?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to get some rest', translation: 'Я собираюсь отдохнуть' },
          { pronoun: 'you', example: 'You are going to get in trouble', translation: 'Ты попадешь в неприятности' },
          { pronoun: 'he', example: 'He is going to get a new car', translation: 'Он собирается купить новую машину' },
          { pronoun: 'we', example: 'We are going to get lunch together', translation: 'Мы собираемся пообедать вместе' },
          { pronoun: 'they', example: 'They are going to get married', translation: 'Они собираются пожениться' },
          { pronoun: 'I', example: 'I am not going to get upset', translation: 'Я не собираюсь расстраиваться', isNegative: true },
          { pronoun: 'you', example: 'Are you going to get that job?', translation: 'Ты собираешься получить ту работу?', isQuestion: true }
        ]
      }
    ]
  },
  
  // 6. MAKE
  {
    word: 'make',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['делать', 'создавать', 'изготавливать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I make breakfast for my family', translation: 'Я готовлю завтрак для своей семьи' },
          { pronoun: 'you', example: 'You make beautiful paintings', translation: 'Ты создаешь красивые картины' },
          { pronoun: 'he', example: 'He makes furniture in his workshop', translation: 'Он делает мебель в своей мастерской' },
          { pronoun: 'she', example: 'She makes her own clothes', translation: 'Она шьет свою собственную одежду' },
          { pronoun: 'we', example: 'We make important decisions together', translation: 'Мы принимаем важные решения вместе' },
          { pronoun: 'they', example: 'They make excellent wine here', translation: 'Они делают отличное вино здесь' },
          { pronoun: 'I', example: 'I do not make the same mistakes', translation: 'Я не делаю те же ошибки', isNegative: true },
          { pronoun: 'you', example: 'Do you make your own bread?', translation: 'Ты печешь свой хлеб?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I made a terrible mistake yesterday', translation: 'Я совершил ужасную ошибку вчера' },
          { pronoun: 'you', example: 'You made a great impression', translation: 'Ты произвел отличное впечатление' },
          { pronoun: 'he', example: 'He made dinner for us', translation: 'Он приготовил нам ужин' },
          { pronoun: 'we', example: 'We made some important changes', translation: 'Мы внесли важные изменения' },
          { pronoun: 'they', example: 'They made a lot of money', translation: 'Они заработали много денег' },
          { pronoun: 'I', example: 'I did not make any promises', translation: 'Я не давал никаких обещаний', isNegative: true },
          { pronoun: 'you', example: 'Did you make this yourself?', translation: 'Ты сам это сделал?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will make it up to you', translation: 'Я загла жу перед тобой свою вину' },
          { pronoun: 'you', example: 'You will make a good leader', translation: 'Ты будешь хорошим лидером' },
          { pronoun: 'he', example: 'He will make the final decision', translation: 'Он примет окончательное решение' },
          { pronoun: 'we', example: 'We will make history together', translation: 'Мы вместе войдем в историю' },
          { pronoun: 'they', example: 'They will make an announcement soon', translation: 'Они скоро сделают объявление' },
          { pronoun: 'I', example: 'I will not make that mistake', translation: 'Я не сделаю эту ошибку', isNegative: true },
          { pronoun: 'you', example: 'Will you make the presentation?', translation: 'Ты сделаешь презентацию?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have made my choice', translation: 'Я сделал свой выбор' },
          { pronoun: 'you', example: 'You have made significant progress', translation: 'Ты добился значительного прогресса' },
          { pronoun: 'he', example: 'He has made many friends here', translation: 'Он завел много друзей здесь' },
          { pronoun: 'we', example: 'We have made several attempts already', translation: 'Мы уже сделали несколько попыток' },
          { pronoun: 'they', example: 'They have made a wonderful discovery', translation: 'Они сделали замечательное открытие' },
          { pronoun: 'I', example: 'I have not made up my mind', translation: 'Я не принял решение', isNegative: true },
          { pronoun: 'you', example: 'Have you made any plans yet?', translation: 'Ты уже составил какие-нибудь планы?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am making dinner right now', translation: 'Я готовлю ужин прямо сейчас' },
          { pronoun: 'you', example: 'You are making too much noise', translation: 'Ты производишь слишком много шума' },
          { pronoun: 'he', example: 'He is making a video tutorial', translation: 'Он делает видео-урок' },
          { pronoun: 'we', example: 'We are making great progress today', translation: 'Мы делаем отличный прогресс сегодня' },
          { pronoun: 'they', example: 'They are making a documentary film', translation: 'Они снимают документальный фильм' },
          { pronoun: 'I', example: 'I am not making any excuses', translation: 'Я не делаю никаких оправданий', isNegative: true },
          { pronoun: 'you', example: 'What are you making for lunch?', translation: 'Что ты готовишь на обед?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to make some changes', translation: 'Я собираюсь внести некоторые изменения' },
          { pronoun: 'you', example: 'You are going to make it', translation: 'Ты справишься' },
          { pronoun: 'he', example: 'He is going to make a speech', translation: 'Он собирается произнести речь' },
          { pronoun: 'we', example: 'We are going to make a difference', translation: 'Мы собираемся изменить ситуацию' },
          { pronoun: 'they', example: 'They are going to make an offer', translation: 'Они собираются сделать предложение' },
          { pronoun: 'I', example: 'I am not going to make excuses', translation: 'Я не собираюсь оправдываться', isNegative: true },
          { pronoun: 'you', example: 'Are you going to make dinner?', translation: 'Ты собираешься готовить ужин?', isQuestion: true }
        ]
      }
    ]
  },

  // 7. GO
  {
    word: 'go',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['идти', 'ехать', 'отправляться']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I go to the gym every morning', translation: 'Я хожу в спортзал каждое утро' },
          { pronoun: 'you', example: 'You go to work by train', translation: 'Ты ездишь на работу на поезде' },
          { pronoun: 'he', example: 'He goes shopping on weekends', translation: 'Он ходит за покупками по выходным' },
          { pronoun: 'she', example: 'She goes running every evening', translation: 'Она бегает каждый вечер' },
          { pronoun: 'we', example: 'We go to that restaurant often', translation: 'Мы часто ходим в тот ресторан' },
          { pronoun: 'they', example: 'They go abroad every summer', translation: 'Они ездят за границу каждое лето' },
          { pronoun: 'I', example: 'I do not go out much', translation: 'Я не выхожу часто', isNegative: true },
          { pronoun: 'you', example: 'Where do you go for vacation?', translation: 'Куда ты ездишь в отпуск?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I went to Paris last month', translation: 'Я ездил в Париж в прошлом месяце' },
          { pronoun: 'you', example: 'You went to the wrong address', translation: 'Ты пошел не по тому адресу' },
          { pronoun: 'he', example: 'He went home early yesterday', translation: 'Он пошел домой рано вчера' },
          { pronoun: 'we', example: 'We went to the concert together', translation: 'Мы вместе ходили на концерт' },
          { pronoun: 'they', example: 'They went on a long trip', translation: 'Они отправились в долгое путешествие' },
          { pronoun: 'I', example: 'I did not go to the party', translation: 'Я не ходил на вечеринку', isNegative: true },
          { pronoun: 'you', example: 'Did you go to the meeting?', translation: 'Ты ходил на встречу?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will go there next week', translation: 'Я поеду туда на следующей неделе' },
          { pronoun: 'you', example: 'You will go far in life', translation: 'Ты далеко пойдешь в жизни' },
          { pronoun: 'he', example: 'He will go to university soon', translation: 'Он скоро поступит в университет' },
          { pronoun: 'we', example: 'We will go together if you want', translation: 'Мы пойдем вместе, если хочешь' },
          { pronoun: 'they', example: 'They will go on vacation soon', translation: 'Они скоро поедут в отпуск' },
          { pronoun: 'I', example: 'I will not go alone', translation: 'Я не пойду один', isNegative: true },
          { pronoun: 'you', example: 'Will you go with me?', translation: 'Ты пойдешь со мной?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have gone there many times', translation: 'Я ходил туда много раз' },
          { pronoun: 'you', example: 'You have gone too far this time', translation: 'Ты зашел слишком далеко на этот раз' },
          { pronoun: 'he', example: 'He has gone to the store', translation: 'Он ушел в магазин' },
          { pronoun: 'we', example: 'We have gone through a lot', translation: 'Мы много пережили' },
          { pronoun: 'they', example: 'They have gone on many adventures', translation: 'Они побывали во многих приключениях' },
          { pronoun: 'I', example: 'I have not gone anywhere lately', translation: 'Я никуда не ходил в последнее время', isNegative: true },
          { pronoun: 'you', example: 'Have you gone to that place?', translation: 'Ты ходил в то место?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am going to the store', translation: 'Я иду в магазин' },
          { pronoun: 'you', example: 'You are going the wrong way', translation: 'Ты идешь не в ту сторону' },
          { pronoun: 'he', example: 'He is going through a difficult time', translation: 'Он переживает трудное время' },
          { pronoun: 'we', example: 'We are going home right now', translation: 'Мы идем домой прямо сейчас' },
          { pronoun: 'they', example: 'They are going to the beach', translation: 'Они едут на пляж' },
          { pronoun: 'I', example: 'I am not going anywhere today', translation: 'Я никуда не иду сегодня', isNegative: true },
          { pronoun: 'you', example: 'Where are you going so early?', translation: 'Куда ты идешь так рано?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to go home', translation: 'Я собираюсь идти домой' },
          { pronoun: 'you', example: 'You are going to go crazy', translation: 'Ты сойдешь с ума' },
          { pronoun: 'he', example: 'He is going to go abroad', translation: 'Он собирается поехать за границу' },
          { pronoun: 'we', example: 'We are going to go together', translation: 'Мы собираемся пойти вместе' },
          { pronoun: 'they', example: 'They are going to go shopping', translation: 'Они собираются пойти за покупками' },
          { pronoun: 'I', example: 'I am not going to go there', translation: 'Я не собираюсь идти туда', isNegative: true },
          { pronoun: 'you', example: 'Are you going to go alone?', translation: 'Ты собираешься идти один?', isQuestion: true }
        ]
      }
    ]
  },

  // 8. KNOW
  {
    word: 'know',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['знать', 'понимать', 'осознавать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I know the answer to that question', translation: 'Я знаю ответ на этот вопрос' },
          { pronoun: 'you', example: 'You know what I mean', translation: 'Ты знаешь, что я имею в виду' },
          { pronoun: 'he', example: 'He knows all the famous people', translation: 'Он знает всех известных людей' },
          { pronoun: 'she', example: 'She knows three foreign languages', translation: 'Она знает три иностранных языка' },
          { pronoun: 'we', example: 'We know a great place for dinner', translation: 'Мы знаем отличное место для ужина' },
          { pronoun: 'they', example: 'They know the city very well', translation: 'Они очень хорошо знают город' },
          { pronoun: 'I', example: 'I do not know his name', translation: 'Я не знаю его имени', isNegative: true },
          { pronoun: 'you', example: 'Do you know where she is?', translation: 'Ты знаешь, где она?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I knew this would happen', translation: 'Я знал, что это произойдет' },
          { pronoun: 'you', example: 'You knew about it all along', translation: 'Ты знал об этом все время' },
          { pronoun: 'he', example: 'He knew the right answer immediately', translation: 'Он сразу знал правильный ответ' },
          { pronoun: 'we', example: 'We knew each other in college', translation: 'Мы знали друг друга в колледже' },
          { pronoun: 'they', example: 'They knew the risks involved', translation: 'Они знали о связанных рисках' },
          { pronoun: 'I', example: 'I did not know you were coming', translation: 'Я не знал, что ты придешь', isNegative: true },
          { pronoun: 'you', example: 'Did you know about the surprise?', translation: 'Ты знал о сюрпризе?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will know the results soon', translation: 'Я скоро узнаю результаты' },
          { pronoun: 'you', example: 'You will know when you see it', translation: 'Ты узнаешь, когда увидишь это' },
          { pronoun: 'he', example: 'He will know what to do', translation: 'Он будет знать, что делать' },
          { pronoun: 'we', example: 'We will know more information tomorrow', translation: 'Мы узнаем больше информации завтра' },
          { pronoun: 'they', example: 'They will know the truth eventually', translation: 'Они в конце концов узнают правду' },
          { pronoun: 'I', example: 'I will not know until Monday', translation: 'Я не узнаю до понедельника', isNegative: true },
          { pronoun: 'you', example: 'Will you know by then?', translation: 'Ты узнаешь к тому времени?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have known him for years', translation: 'Я знаю его много лет' },
          { pronoun: 'you', example: 'You have known about this forever', translation: 'Ты знаешь об этом целую вечность' },
          { pronoun: 'he', example: 'He has known her since childhood', translation: 'Он знает ее с детства' },
          { pronoun: 'we', example: 'We have known each other forever', translation: 'Мы знаем друг друга целую вечность' },
          { pronoun: 'they', example: 'They have known the truth all along', translation: 'Они знали правду все время' },
          { pronoun: 'I', example: 'I have not known peace lately', translation: 'Я не знал покоя в последнее время', isNegative: true },
          { pronoun: 'you', example: 'Have you known about this long?', translation: 'Ты давно знаешь об этом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am knowing more about it now', translation: 'Я узнаю больше об этом сейчас' },
          { pronoun: 'you', example: 'You are knowing him better', translation: 'Ты узнаешь его лучше' },
          { pronoun: 'he', example: 'He is knowing the truth gradually', translation: 'Он постепенно узнает правду' },
          { pronoun: 'we', example: 'We are knowing each other better', translation: 'Мы лучше узнаем друг друга' },
          { pronoun: 'they', example: 'They are knowing more every day', translation: 'Они узнают больше каждый день' },
          { pronoun: 'I', example: 'I am not knowing what to say', translation: 'Я не знаю, что сказать', isNegative: true },
          { pronoun: 'you', example: 'Are you knowing the answer yet?', translation: 'Ты уже знаешь ответ?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to know everything soon', translation: 'Я скоро узнаю все' },
          { pronoun: 'you', example: 'You are going to know the truth', translation: 'Ты узнаешь правду' },
          { pronoun: 'he', example: 'He is going to know better', translation: 'Он узнает получше' },
          { pronoun: 'we', example: 'We are going to know for sure', translation: 'Мы узнаем наверняка' },
          { pronoun: 'they', example: 'They are going to know soon enough', translation: 'Они достаточно скоро узнают' },
          { pronoun: 'I', example: 'I am not going to know everything', translation: 'Я не узнаю все', isNegative: true },
          { pronoun: 'you', example: 'Are you going to know tomorrow?', translation: 'Ты узнаешь завтра?', isQuestion: true }
        ]
      }
    ]
  },

  // 9. TAKE
  {
    word: 'take',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['брать', 'взять', 'забирать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I take the bus to work', translation: 'Я езжу на работу на автобусе' },
          { pronoun: 'you', example: 'You take great photos', translation: 'Ты делаешь отличные фотографии' },
          { pronoun: 'he', example: 'He takes his dog for walks', translation: 'Он выгуливает свою собаку' },
          { pronoun: 'she', example: 'She takes care of her parents', translation: 'Она заботится о своих родителях' },
          { pronoun: 'we', example: 'We take turns driving the car', translation: 'Мы водим машину по очереди' },
          { pronoun: 'they', example: 'They take their job very seriously', translation: 'Они относятся к своей работе очень серьезно' },
          { pronoun: 'I', example: 'I do not take sugar in coffee', translation: 'Я не кладу сахар в кофе', isNegative: true },
          { pronoun: 'you', example: 'Do you take credit cards?', translation: 'Вы принимаете кредитные карты?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I took the wrong train yesterday', translation: 'Я сел не на тот поезд вчера' },
          { pronoun: 'you', example: 'You took my advice seriously', translation: 'Ты серьезно воспринял мой совет' },
          { pronoun: 'he', example: 'He took a long vacation', translation: 'Он взял длинный отпуск' },
          { pronoun: 'we', example: 'We took many beautiful pictures', translation: 'Мы сделали много красивых фотографий' },
          { pronoun: 'they', example: 'They took all the available seats', translation: 'Они заняли все свободные места' },
          { pronoun: 'I', example: 'I did not take any chances', translation: 'Я не рисковал', isNegative: true },
          { pronoun: 'you', example: 'Did you take your medicine?', translation: 'Ты принял свое лекарство?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will take care of everything', translation: 'Я позабочусь обо всем' },
          { pronoun: 'you', example: 'You will take my place tomorrow', translation: 'Ты займешь мое место завтра' },
          { pronoun: 'he', example: 'He will take the exam next month', translation: 'Он сдаст экзамен в следующем месяце' },
          { pronoun: 'we', example: 'We will take the first flight', translation: 'Мы возьмем первый рейс' },
          { pronoun: 'they', example: 'They will take appropriate action', translation: 'Они примут соответствующие меры' },
          { pronoun: 'I', example: 'I will not take no for answer', translation: 'Я не приму отказа', isNegative: true },
          { pronoun: 'you', example: 'Will you take this opportunity?', translation: 'Ты воспользуешься этой возможностью?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have taken all the necessary steps', translation: 'Я предпринял все необходимые шаги' },
          { pronoun: 'you', example: 'You have taken this too far', translation: 'Ты зашел слишком далеко' },
          { pronoun: 'he', example: 'He has taken the lead', translation: 'Он вырвался вперед' },
          { pronoun: 'we', example: 'We have taken many trips together', translation: 'Мы совершили много поездок вместе' },
          { pronoun: 'they', example: 'They have taken the decision seriously', translation: 'Они отнеслись к решению серьезно' },
          { pronoun: 'I', example: 'I have not taken any breaks', translation: 'Я не делал никаких перерывов', isNegative: true },
          { pronoun: 'you', example: 'Have you taken your vitamins today?', translation: 'Ты принял свои витамины сегодня?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am taking a course online', translation: 'Я прохожу курс онлайн' },
          { pronoun: 'you', example: 'You are taking too much time', translation: 'Ты занимаешь слишком много времени' },
          { pronoun: 'he', example: 'He is taking a shower right now', translation: 'Он принимает душ прямо сейчас' },
          { pronoun: 'we', example: 'We are taking a short break', translation: 'Мы делаем короткий перерыв' },
          { pronoun: 'they', example: 'They are taking the matter seriously', translation: 'Они относятся к вопросу серьезно' },
          { pronoun: 'I', example: 'I am not taking any risks', translation: 'Я не рискую', isNegative: true },
          { pronoun: 'you', example: 'Are you taking notes?', translation: 'Ты делаешь заметки?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to take a nap', translation: 'Я собираюсь вздремнуть' },
          { pronoun: 'you', example: 'You are going to take the test', translation: 'Ты собираешься сдавать тест' },
          { pronoun: 'he', example: 'He is going to take his time', translation: 'Он не собирается торопиться' },
          { pronoun: 'we', example: 'We are going to take a vacation', translation: 'Мы собираемся взять отпуск' },
          { pronoun: 'they', example: 'They are going to take control', translation: 'Они собираются взять контроль' },
          { pronoun: 'I', example: 'I am not going to take orders', translation: 'Я не собираюсь получать приказы', isNegative: true },
          { pronoun: 'you', example: 'Are you going to take the job?', translation: 'Ты собираешься браться за работу?', isQuestion: true }
        ]
      }
    ]
  },

  // 10. SEE
  {
    word: 'see',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['видеть', 'смотреть', 'понимать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I see what you mean now', translation: 'Я понимаю, что ты имеешь в виду' },
          { pronoun: 'you', example: 'You see things differently than me', translation: 'Ты видишь вещи иначе, чем я' },
          { pronoun: 'he', example: 'He sees his family every weekend', translation: 'Он видится с семьей каждые выходные' },
          { pronoun: 'she', example: 'She sees a doctor regularly', translation: 'Она регулярно ходит к врачу' },
          { pronoun: 'we', example: 'We see each other quite often', translation: 'Мы видимся довольно часто' },
          { pronoun: 'they', example: 'They see the potential in you', translation: 'Они видят в тебе потенциал' },
          { pronoun: 'I', example: 'I do not see the problem', translation: 'Я не вижу проблемы', isNegative: true },
          { pronoun: 'you', example: 'Do you see that building?', translation: 'Ты видишь то здание?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I saw a beautiful sunset yesterday', translation: 'Я видел красивый закат вчера' },
          { pronoun: 'you', example: 'You saw the whole thing happen', translation: 'Ты видел, как все произошло' },
          { pronoun: 'he', example: 'He saw his old friend downtown', translation: 'Он встретил своего старого друга в центре' },
          { pronoun: 'we', example: 'We saw that movie last week', translation: 'Мы смотрели тот фильм на прошлой неделе' },
          { pronoun: 'they', example: 'They saw the accident this morning', translation: 'Они видели аварию этим утром' },
          { pronoun: 'I', example: 'I did not see you there', translation: 'Я не видел тебя там', isNegative: true },
          { pronoun: 'you', example: 'Did you see the news?', translation: 'Ты видел новости?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will see you tomorrow morning', translation: 'Я увижу тебя завтра утром' },
          { pronoun: 'you', example: 'You will see great results soon', translation: 'Ты скоро увидишь отличные результаты' },
          { pronoun: 'he', example: 'He will see the doctor next week', translation: 'Он пойдет к врачу на следующей неделе' },
          { pronoun: 'we', example: 'We will see what happens', translation: 'Мы посмотрим, что произойдет' },
          { pronoun: 'they', example: 'They will see you at the party', translation: 'Они увидят тебя на вечеринке' },
          { pronoun: 'I', example: 'I will not see him again', translation: 'Я больше не увижу его', isNegative: true },
          { pronoun: 'you', example: 'Will you see her tonight?', translation: 'Ты увидишь ее сегодня вечером?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have seen that film before', translation: 'Я уже видел этот фильм' },
          { pronoun: 'you', example: 'You have seen better days', translation: 'Ты видел лучшие дни' },
          { pronoun: 'he', example: 'He has seen many countries', translation: 'Он побывал во многих странах' },
          { pronoun: 'we', example: 'We have seen this happen before', translation: 'Мы видели, как это случалось раньше' },
          { pronoun: 'they', example: 'They have seen all his movies', translation: 'Они видели все его фильмы' },
          { pronoun: 'I', example: 'I have not seen her lately', translation: 'Я не видел ее в последнее время', isNegative: true },
          { pronoun: 'you', example: 'Have you seen my keys?', translation: 'Ты видел мои ключи?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am seeing someone special now', translation: 'Я встречаюсь с кем-то особенным сейчас' },
          { pronoun: 'you', example: 'You are seeing things too negatively', translation: 'Ты видишь вещи слишком негативно' },
          { pronoun: 'he', example: 'He is seeing a therapist regularly', translation: 'Он регулярно ходит к терапевту' },
          { pronoun: 'we', example: 'We are seeing some improvement finally', translation: 'Мы наконец видим некоторое улучшение' },
          { pronoun: 'they', example: 'They are seeing each other secretly', translation: 'Они встречаются тайно' },
          { pronoun: 'I', example: 'I am not seeing anyone right now', translation: 'Я ни с кем не встречаюсь сейчас', isNegative: true },
          { pronoun: 'you', example: 'Are you seeing what I see?', translation: 'Ты видишь то же, что и я?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to see a show', translation: 'Я собираюсь посмотреть шоу' },
          { pronoun: 'you', example: 'You are going to see amazing things', translation: 'Ты увидишь удивительные вещи' },
          { pronoun: 'he', example: 'He is going to see his parents', translation: 'Он собирается навестить своих родителей' },
          { pronoun: 'we', example: 'We are going to see the exhibition', translation: 'Мы собираемся посмотреть выставку' },
          { pronoun: 'they', example: 'They are going to see a concert', translation: 'Они собираются посмотреть концерт' },
          { pronoun: 'I', example: 'I am not going to see that movie', translation: 'Я не собираюсь смотреть тот фильм', isNegative: true },
          { pronoun: 'you', example: 'Are you going to see them soon?', translation: 'Ты собираешься увидеть их скоро?', isQuestion: true }
        ]
      }
    ]
  },

  // 11. COME
  {
    word: 'come',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['приходить', 'приезжать', 'прибывать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I come here every Tuesday', translation: 'Я прихожу сюда каждый вторник' },
          { pronoun: 'you', example: 'You come from a good family', translation: 'Ты из хорошей семьи' },
          { pronoun: 'he', example: 'He comes to the office early', translation: 'Он приходит в офис рано' },
          { pronoun: 'she', example: 'She comes from a small town', translation: 'Она из маленького города' },
          { pronoun: 'we', example: 'We come to this cafe often', translation: 'Мы часто приходим в это кафе' },
          { pronoun: 'they', example: 'They come here for the food', translation: 'Они приходят сюда ради еды' },
          { pronoun: 'I', example: 'I do not come here alone', translation: 'Я не прихожу сюда один', isNegative: true },
          { pronoun: 'you', example: 'Where do you come from?', translation: 'Откуда ты родом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I came as soon as I could', translation: 'Я пришел, как только смог' },
          { pronoun: 'you', example: 'You came at the perfect time', translation: 'Ты пришел в идеальное время' },
          { pronoun: 'he', example: 'He came to my birthday party', translation: 'Он пришел на мой день рождения' },
          { pronoun: 'we', example: 'We came here last summer', translation: 'Мы приезжали сюда прошлым летом' },
          { pronoun: 'they', example: 'They came with good intentions', translation: 'Они пришли с добрыми намерениями' },
          { pronoun: 'I', example: 'I did not come alone yesterday', translation: 'Я не приходил один вчера', isNegative: true },
          { pronoun: 'you', example: 'Did you come by car?', translation: 'Ты приехал на машине?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will come to your wedding', translation: 'Я приду на твою свадьбу' },
          { pronoun: 'you', example: 'You will come to understand it', translation: 'Ты придешь к пониманию этого' },
          { pronoun: 'he', example: 'He will come back soon', translation: 'Он скоро вернется' },
          { pronoun: 'we', example: 'We will come together as a team', translation: 'Мы объединимся как команда' },
          { pronoun: 'they', example: 'They will come around eventually', translation: 'Они в конце концов согласятся' },
          { pronoun: 'I', example: 'I will not come if raining', translation: 'Я не приду, если будет дождь', isNegative: true },
          { pronoun: 'you', example: 'Will you come with me?', translation: 'Ты пойдешь со мной?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have come a long way', translation: 'Я прошел долгий путь' },
          { pronoun: 'you', example: 'You have come to the right place', translation: 'Ты пришел в правильное место' },
          { pronoun: 'he', example: 'He has come to visit us', translation: 'Он пришел навестить нас' },
          { pronoun: 'we', example: 'We have come so far together', translation: 'Мы так далеко зашли вместе' },
          { pronoun: 'they', example: 'They have come from different countries', translation: 'Они приехали из разных стран' },
          { pronoun: 'I', example: 'I have not come here before', translation: 'Я не приходил сюда раньше', isNegative: true },
          { pronoun: 'you', example: 'Have you come to a decision?', translation: 'Ты пришел к решению?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am coming to the party', translation: 'Я иду на вечеринку' },
          { pronoun: 'you', example: 'You are coming along nicely', translation: 'У тебя хорошо получается' },
          { pronoun: 'he', example: 'He is coming over for dinner', translation: 'Он придет на ужин' },
          { pronoun: 'we', example: 'We are coming to get you', translation: 'Мы едем за тобой' },
          { pronoun: 'they', example: 'They are coming from the airport', translation: 'Они едут из аэропорта' },
          { pronoun: 'I', example: 'I am not coming back tomorrow', translation: 'Я не вернусь завтра', isNegative: true },
          { pronoun: 'you', example: 'Are you coming to the meeting?', translation: 'Ты идешь на встречу?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to come early', translation: 'Я собираюсь прийти рано' },
          { pronoun: 'you', example: 'You are going to come with us', translation: 'Ты пойдешь с нами' },
          { pronoun: 'he', example: 'He is going to come tomorrow', translation: 'Он придет завтра' },
          { pronoun: 'we', example: 'We are going to come together', translation: 'Мы придем вместе' },
          { pronoun: 'they', example: 'They are going to come later', translation: 'Они придут позже' },
          { pronoun: 'I', example: 'I am not going to come alone', translation: 'Я не собираюсь приходить один', isNegative: true },
          { pronoun: 'you', example: 'Are you going to come tonight?', translation: 'Ты придешь сегодня вечером?', isQuestion: true }
        ]
      }
    ]
  },

  // 12. THINK
  {
    word: 'think',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['думать', 'полагать', 'считать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I think about you all the time', translation: 'Я думаю о тебе все время' },
          { pronoun: 'you', example: 'You think too much sometimes', translation: 'Ты иногда слишком много думаешь' },
          { pronoun: 'he', example: 'He thinks this is a mistake', translation: 'Он думает, что это ошибка' },
          { pronoun: 'she', example: 'She thinks about her future', translation: 'Она думает о своем будущем' },
          { pronoun: 'we', example: 'We think the same way', translation: 'Мы мыслим одинаково' },
          { pronoun: 'they', example: 'They think you are right', translation: 'Они думают, что ты прав' },
          { pronoun: 'I', example: 'I do not think so', translation: 'Я так не думаю', isNegative: true },
          { pronoun: 'you', example: 'What do you think about it?', translation: 'Что ты думаешь об этом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I thought you were coming', translation: 'Я думал, ты придешь' },
          { pronoun: 'you', example: 'You thought about it carefully', translation: 'Ты тщательно обдумал это' },
          { pronoun: 'he', example: 'He thought it was a joke', translation: 'Он думал, это шутка' },
          { pronoun: 'we', example: 'We thought the same thing', translation: 'Мы думали то же самое' },
          { pronoun: 'they', example: 'They thought about moving away', translation: 'Они думали о переезде' },
          { pronoun: 'I', example: 'I did not think it through', translation: 'Я не продумал это', isNegative: true },
          { pronoun: 'you', example: 'What did you think of the movie?', translation: 'Что ты думаешь о фильме?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will think about your offer', translation: 'Я подумаю о твоем предложении' },
          { pronoun: 'you', example: 'You will think differently tomorrow', translation: 'Ты будешь думать иначе завтра' },
          { pronoun: 'he', example: 'He will think of something', translation: 'Он что-нибудь придумает' },
          { pronoun: 'we', example: 'We will think it over carefully', translation: 'Мы тщательно это обдумаем' },
          { pronoun: 'they', example: 'They will think you are crazy', translation: 'Они подумают, что ты сумасшедший' },
          { pronoun: 'I', example: 'I will not think about it', translation: 'Я не буду думать об этом', isNegative: true },
          { pronoun: 'you', example: 'Will you think about it?', translation: 'Ты подумаешь об этом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have thought about this carefully', translation: 'Я тщательно обдумал это' },
          { pronoun: 'you', example: 'You have thought of everything', translation: 'Ты подумал обо всем' },
          { pronoun: 'he', example: 'He has thought about it deeply', translation: 'Он глубоко задумался об этом' },
          { pronoun: 'we', example: 'We have thought the same thing', translation: 'Мы думали то же самое' },
          { pronoun: 'they', example: 'They have thought about moving', translation: 'Они думали о переезде' },
          { pronoun: 'I', example: 'I have not thought about that', translation: 'Я не думал об этом', isNegative: true },
          { pronoun: 'you', example: 'Have you thought about my proposal?', translation: 'Ты подумал о моем предложении?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am thinking about changing jobs', translation: 'Я думаю о смене работы' },
          { pronoun: 'you', example: 'You are thinking too much again', translation: 'Ты снова слишком много думаешь' },
          { pronoun: 'he', example: 'He is thinking about his options', translation: 'Он обдумывает свои варианты' },
          { pronoun: 'we', example: 'We are thinking of moving abroad', translation: 'Мы думаем о переезде за границу' },
          { pronoun: 'they', example: 'They are thinking about getting married', translation: 'Они думают о женитьбе' },
          { pronoun: 'I', example: 'I am not thinking clearly right now', translation: 'Я не мыслю ясно сейчас', isNegative: true },
          { pronoun: 'you', example: 'What are you thinking about?', translation: 'О чем ты думаешь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to think positively', translation: 'Я буду думать позитивно' },
          { pronoun: 'you', example: 'You are going to think differently', translation: 'Ты будешь думать иначе' },
          { pronoun: 'he', example: 'He is going to think about it', translation: 'Он подумает об этом' },
          { pronoun: 'we', example: 'We are going to think together', translation: 'Мы подумаем вместе' },
          { pronoun: 'they', example: 'They are going to think carefully', translation: 'Они тщательно подумают' },
          { pronoun: 'I', example: 'I am not going to think negatively', translation: 'Я не буду думать негативно', isNegative: true },
          { pronoun: 'you', example: 'Are you going to think about it?', translation: 'Ты подумаешь об этом?', isQuestion: true }
        ]
      }
    ]
  },

  // 13. LOOK
  {
    word: 'look',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['смотреть', 'выглядеть', 'искать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I look at the stars every night', translation: 'Я смотрю на звезды каждую ночь' },
          { pronoun: 'you', example: 'You look great in that dress', translation: 'Ты отлично выглядишь в том платье' },
          { pronoun: 'he', example: 'He looks like his father', translation: 'Он похож на своего отца' },
          { pronoun: 'she', example: 'She looks for her keys everywhere', translation: 'Она везде ищет свои ключи' },
          { pronoun: 'we', example: 'We look forward to seeing you', translation: 'Мы с нетерпением ждем встречи с тобой' },
          { pronoun: 'they', example: 'They look very happy together', translation: 'Они выглядят очень счастливыми вместе' },
          { pronoun: 'I', example: 'I do not look my age', translation: 'Я не выгляжу на свой возраст', isNegative: true },
          { pronoun: 'you', example: 'Do you look after your parents?', translation: 'Ты заботишься о своих родителях?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I looked everywhere for my phone', translation: 'Я везде искал свой телефон' },
          { pronoun: 'you', example: 'You looked worried this morning', translation: 'Ты выглядел обеспокоенным сегодня утром' },
          { pronoun: 'he', example: 'He looked at me strangely', translation: 'Он странно посмотрел на меня' },
          { pronoun: 'we', example: 'We looked into the matter carefully', translation: 'Мы тщательно изучили вопрос' },
          { pronoun: 'they', example: 'They looked for hours without success', translation: 'Они искали часами без успеха' },
          { pronoun: 'I', example: 'I did not look back', translation: 'Я не оглядывался назад', isNegative: true },
          { pronoun: 'you', example: 'Did you look in the drawer?', translation: 'Ты посмотрел в ящике?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will look into this matter', translation: 'Я изучу этот вопрос' },
          { pronoun: 'you', example: 'You will look amazing tomorrow', translation: 'Ты будешь выглядеть потрясающе завтра' },
          { pronoun: 'he', example: 'He will look for a new job', translation: 'Он будет искать новую работу' },
          { pronoun: 'we', example: 'We will look at all the options', translation: 'Мы рассмотрим все варианты' },
          { pronoun: 'they', example: 'They will look after the children', translation: 'Они присмотрят за детьми' },
          { pronoun: 'I', example: 'I will not look the other way', translation: 'Я не буду смотреть в другую сторону', isNegative: true },
          { pronoun: 'you', example: 'Will you look at my paper?', translation: 'Ты посмотришь на мою работу?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have looked for hours already', translation: 'Я уже ищу несколько часов' },
          { pronoun: 'you', example: 'You have looked better than this', translation: 'Ты выглядел лучше' },
          { pronoun: 'he', example: 'He has looked everywhere for it', translation: 'Он везде искал это' },
          { pronoun: 'we', example: 'We have looked into the problem', translation: 'Мы изучили проблему' },
          { pronoun: 'they', example: 'They have looked at all options', translation: 'Они рассмотрели все варианты' },
          { pronoun: 'I', example: 'I have not looked at it yet', translation: 'Я еще не смотрел на это', isNegative: true },
          { pronoun: 'you', example: 'Have you looked in the garage?', translation: 'Ты посмотрел в гараже?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am looking for my glasses', translation: 'Я ищу свои очки' },
          { pronoun: 'you', example: 'You are looking much better today', translation: 'Ты выглядишь намного лучше сегодня' },
          { pronoun: 'he', example: 'He is looking at the menu', translation: 'Он смотрит в меню' },
          { pronoun: 'we', example: 'We are looking forward to it', translation: 'Мы с нетерпением ждем этого' },
          { pronoun: 'they', example: 'They are looking for a new house', translation: 'Они ищут новый дом' },
          { pronoun: 'I', example: 'I am not looking for trouble', translation: 'Я не ищу неприятностей', isNegative: true },
          { pronoun: 'you', example: 'What are you looking at?', translation: 'На что ты смотришь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to look fantastic', translation: 'Я буду выглядеть фантастически' },
          { pronoun: 'you', example: 'You are going to look silly', translation: 'Ты будешь выглядеть глупо' },
          { pronoun: 'he', example: 'He is going to look for work', translation: 'Он собирается искать работу' },
          { pronoun: 'we', example: 'We are going to look into it', translation: 'Мы изучим это' },
          { pronoun: 'they', example: 'They are going to look around', translation: 'Они собираются осмотреться' },
          { pronoun: 'I', example: 'I am not going to look back', translation: 'Я не собираюсь оглядываться назад', isNegative: true },
          { pronoun: 'you', example: 'Are you going to look for it?', translation: 'Ты собираешься искать это?', isQuestion: true }
        ]
      }
    ]
  },

  // 14. WANT
  {
    word: 'want',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['хотеть', 'желать', 'нуждаться']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I want to learn Spanish', translation: 'Я хочу выучить испанский' },
          { pronoun: 'you', example: 'You want the best for everyone', translation: 'Ты хочешь лучшего для всех' },
          { pronoun: 'he', example: 'He wants a new car', translation: 'Он хочет новую машину' },
          { pronoun: 'she', example: 'She wants to travel the world', translation: 'Она хочет путешествовать по миру' },
          { pronoun: 'we', example: 'We want to help you', translation: 'Мы хотим помочь тебе' },
          { pronoun: 'they', example: 'They want to buy a house', translation: 'Они хотят купить дом' },
          { pronoun: 'I', example: 'I do not want any trouble', translation: 'Я не хочу никаких неприятностей', isNegative: true },
          { pronoun: 'you', example: 'Do you want some coffee?', translation: 'Хочешь кофе?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I wanted to tell you something', translation: 'Я хотел тебе кое-что сказать' },
          { pronoun: 'you', example: 'You wanted to come with us', translation: 'Ты хотел пойти с нами' },
          { pronoun: 'he', example: 'He wanted to be a doctor', translation: 'Он хотел быть врачом' },
          { pronoun: 'we', example: 'We wanted to help you succeed', translation: 'Мы хотели помочь тебе преуспеть' },
          { pronoun: 'they', example: 'They wanted to go home', translation: 'Они хотели пойти домой' },
          { pronoun: 'I', example: 'I did not want to hurt you', translation: 'Я не хотел обидеть тебя', isNegative: true },
          { pronoun: 'you', example: 'Did you want something else?', translation: 'Ты хотел что-то еще?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will want more information soon', translation: 'Я скоро захочу больше информации' },
          { pronoun: 'you', example: 'You will want to see this', translation: 'Ты захочешь увидеть это' },
          { pronoun: 'he', example: 'He will want his money back', translation: 'Он захочет вернуть свои деньги' },
          { pronoun: 'we', example: 'We will want to celebrate together', translation: 'Мы захотим отпраздновать вместе' },
          { pronoun: 'they', example: 'They will want to know everything', translation: 'Они захотят знать все' },
          { pronoun: 'I', example: 'I will not want to leave', translation: 'Я не захочу уезжать', isNegative: true },
          { pronoun: 'you', example: 'Will you want dessert later?', translation: 'Ты захочешь десерт позже?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have wanted this for years', translation: 'Я хотел этого годами' },
          { pronoun: 'you', example: 'You have wanted to visit Japan', translation: 'Ты хотел посетить Японию' },
          { pronoun: 'he', example: 'He has wanted to change jobs', translation: 'Он хотел сменить работу' },
          { pronoun: 'we', example: 'We have wanted to meet you', translation: 'Мы хотели встретиться с тобой' },
          { pronoun: 'they', example: 'They have wanted this opportunity', translation: 'Они хотели эту возможность' },
          { pronoun: 'I', example: 'I have not wanted to interfere', translation: 'Я не хотел вмешиваться', isNegative: true },
          { pronoun: 'you', example: 'Have you wanted to quit?', translation: 'Ты хотел уйти?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am wanting to try something new', translation: 'Я хочу попробовать что-то новое' },
          { pronoun: 'you', example: 'You are wanting too much', translation: 'Ты хочешь слишком многого' },
          { pronoun: 'he', example: 'He is wanting to make changes', translation: 'Он хочет внести изменения' },
          { pronoun: 'we', example: 'We are wanting to improve things', translation: 'Мы хотим улучшить ситуацию' },
          { pronoun: 'they', example: 'They are wanting a better life', translation: 'Они хотят лучшей жизни' },
          { pronoun: 'I', example: 'I am not wanting any excuses', translation: 'Я не хочу никаких оправданий', isNegative: true },
          { pronoun: 'you', example: 'What are you wanting from me?', translation: 'Что ты хочешь от меня?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to want answers', translation: 'Я буду хотеть ответов' },
          { pronoun: 'you', example: 'You are going to want this', translation: 'Ты захочешь это' },
          { pronoun: 'he', example: 'He is going to want proof', translation: 'Он захочет доказательств' },
          { pronoun: 'we', example: 'We are going to want details', translation: 'Мы захотим подробностей' },
          { pronoun: 'they', example: 'They are going to want changes', translation: 'Они захотят изменений' },
          { pronoun: 'I', example: 'I am not going to want help', translation: 'Я не захочу помощи', isNegative: true },
          { pronoun: 'you', example: 'Are you going to want more?', translation: 'Ты захочешь еще?', isQuestion: true }
        ]
      }
    ]
  },

  // 15. GIVE
  {
    word: 'give',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['давать', 'дарить', 'предоставлять']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I give money to charity', translation: 'Я даю деньги на благотворительность' },
          { pronoun: 'you', example: 'You give great advice', translation: 'Ты даешь отличные советы' },
          { pronoun: 'he', example: 'He gives piano lessons', translation: 'Он дает уроки фортепиано' },
          { pronoun: 'she', example: 'She gives her best every day', translation: 'Она выкладывается на полную каждый день' },
          { pronoun: 'we', example: 'We give presents on birthdays', translation: 'Мы дарим подарки на дни рождения' },
          { pronoun: 'they', example: 'They give excellent customer service', translation: 'Они обеспечивают отличный сервис' },
          { pronoun: 'I', example: 'I do not give up easily', translation: 'Я не сдаюсь легко', isNegative: true },
          { pronoun: 'you', example: 'Do you give discounts to students?', translation: 'Вы даете скидки студентам?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I gave her my phone number', translation: 'Я дал ей свой номер телефона' },
          { pronoun: 'you', example: 'You gave me good advice', translation: 'Ты дал мне хороший совет' },
          { pronoun: 'he', example: 'He gave a wonderful presentation', translation: 'Он сделал замечательную презентацию' },
          { pronoun: 'we', example: 'We gave them a warm welcome', translation: 'Мы тепло их встретили' },
          { pronoun: 'they', example: 'They gave us a generous discount', translation: 'Они дали нам щедрую скидку' },
          { pronoun: 'I', example: 'I did not give them permission', translation: 'Я не давал им разрешения', isNegative: true },
          { pronoun: 'you', example: 'Did you give him the message?', translation: 'Ты передал ему сообщение?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will give you my answer tomorrow', translation: 'Я дам тебе свой ответ завтра' },
          { pronoun: 'you', example: 'You will give a great speech', translation: 'Ты произнесешь отличную речь' },
          { pronoun: 'he', example: 'He will give us more information', translation: 'Он даст нам больше информации' },
          { pronoun: 'we', example: 'We will give it our best shot', translation: 'Мы сделаем все возможное' },
          { pronoun: 'they', example: 'They will give you full support', translation: 'Они окажут тебе полную поддержку' },
          { pronoun: 'I', example: 'I will not give up on you', translation: 'Я не сдамся на тебе', isNegative: true },
          { pronoun: 'you', example: 'Will you give me another chance?', translation: 'Ты дашь мне еще один шанс?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have given you many chances', translation: 'Я дал тебе много шансов' },
          { pronoun: 'you', example: 'You have given me great memories', translation: 'Ты подарил мне прекрасные воспоминания' },
          { pronoun: 'he', example: 'He has given his whole life', translation: 'Он посвятил всю свою жизнь' },
          { pronoun: 'we', example: 'We have given our full support', translation: 'Мы оказали полную поддержку' },
          { pronoun: 'they', example: 'They have given us valuable feedback', translation: 'Они дали нам ценную обратную связь' },
          { pronoun: 'I', example: 'I have not given up hope', translation: 'Я не потерял надежду', isNegative: true },
          { pronoun: 'you', example: 'Have you given any thought to it?', translation: 'Ты вообще думал об этом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am giving a presentation today', translation: 'Я делаю презентацию сегодня' },
          { pronoun: 'you', example: 'You are giving me a headache', translation: 'Ты вызываешь у меня головную боль' },
          { pronoun: 'he', example: 'He is giving free samples away', translation: 'Он раздает бесплатные образцы' },
          { pronoun: 'we', example: 'We are giving back to community', translation: 'Мы возвращаем долг обществу' },
          { pronoun: 'they', example: 'They are giving their best effort', translation: 'Они выкладываются по максимуму' },
          { pronoun: 'I', example: 'I am not giving any interviews', translation: 'Я не даю никаких интервью', isNegative: true },
          { pronoun: 'you', example: 'Are you giving up already?', translation: 'Ты уже сдаешься?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to give her flowers', translation: 'Я собираюсь подарить ей цветы' },
          { pronoun: 'you', example: 'You are going to give me answers', translation: 'Ты дашь мне ответы' },
          { pronoun: 'he', example: 'He is going to give a concert', translation: 'Он собирается дать концерт' },
          { pronoun: 'we', example: 'We are going to give it away', translation: 'Мы собираемся отдать это' },
          { pronoun: 'they', example: 'They are going to give us feedback', translation: 'Они дадут нам обратную связь' },
          { pronoun: 'I', example: 'I am not going to give details', translation: 'Я не собираюсь давать подробности', isNegative: true },
          { pronoun: 'you', example: 'Are you going to give a speech?', translation: 'Ты собираешься произнести речь?', isQuestion: true }
        ]
      }
    ]
  },

  // 16. USE
  {
    word: 'use',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['использовать', 'применять', 'употреблять']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I use this app every day', translation: 'Я использую это приложение каждый день' },
          { pronoun: 'you', example: 'You use too much salt', translation: 'Ты используешь слишком много соли' },
          { pronoun: 'he', example: 'He uses public transportation daily', translation: 'Он пользуется общественным транспортом ежедневно' },
          { pronoun: 'she', example: 'She uses her phone for work', translation: 'Она использует телефон для работы' },
          { pronoun: 'we', example: 'We use renewable energy sources', translation: 'Мы используем возобновляемые источники энергии' },
          { pronoun: 'they', example: 'They use the latest technology', translation: 'Они используют новейшие технологии' },
          { pronoun: 'I', example: 'I do not use social media', translation: 'Я не пользуюсь социальными сетями', isNegative: true },
          { pronoun: 'you', example: 'Do you use this software?', translation: 'Ты используешь эту программу?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I used all my savings', translation: 'Я использовал все свои сбережения' },
          { pronoun: 'you', example: 'You used the wrong password', translation: 'Ты использовал неправильный пароль' },
          { pronoun: 'he', example: 'He used every opportunity available', translation: 'Он использовал каждую доступную возможность' },
          { pronoun: 'we', example: 'We used a different approach', translation: 'Мы использовали другой подход' },
          { pronoun: 'they', example: 'They used their connections wisely', translation: 'Они мудро использовали свои связи' },
          { pronoun: 'I', example: 'I did not use my credit card', translation: 'Я не использовал свою кредитную карту', isNegative: true },
          { pronoun: 'you', example: 'Did you use the instructions?', translation: 'Ты пользовался инструкцией?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will use this opportunity wisely', translation: 'Я мудро использую эту возможность' },
          { pronoun: 'you', example: 'You will use these skills later', translation: 'Ты используешь эти навыки позже' },
          { pronoun: 'he', example: 'He will use a different method', translation: 'Он использует другой метод' },
          { pronoun: 'we', example: 'We will use all available resources', translation: 'Мы используем все доступные ресурсы' },
          { pronoun: 'they', example: 'They will use the new system', translation: 'Они будут использовать новую систему' },
          { pronoun: 'I', example: 'I will not use force', translation: 'Я не буду применять силу', isNegative: true },
          { pronoun: 'you', example: 'Will you use this tool?', translation: 'Ты будешь использовать этот инструмент?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have used this product before', translation: 'Я использовал этот продукт раньше' },
          { pronoun: 'you', example: 'You have used all your chances', translation: 'Ты использовал все свои шансы' },
          { pronoun: 'he', example: 'He has used that excuse before', translation: 'Он использовал это оправдание раньше' },
          { pronoun: 'we', example: 'We have used this method successfully', translation: 'Мы успешно использовали этот метод' },
          { pronoun: 'they', example: 'They have used every available option', translation: 'Они использовали каждую доступную опцию' },
          { pronoun: 'I', example: 'I have not used it yet', translation: 'Я еще не использовал это', isNegative: true },
          { pronoun: 'you', example: 'Have you used this before?', translation: 'Ты использовал это раньше?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am using the computer now', translation: 'Я использую компьютер сейчас' },
          { pronoun: 'you', example: 'You are using too much data', translation: 'Ты используешь слишком много данных' },
          { pronoun: 'he', example: 'He is using a new technique', translation: 'Он использует новую технику' },
          { pronoun: 'we', example: 'We are using all available space', translation: 'Мы используем все доступное пространство' },
          { pronoun: 'they', example: 'They are using sustainable materials', translation: 'Они используют устойчивые материалы' },
          { pronoun: 'I', example: 'I am not using that anymore', translation: 'Я больше этим не пользуюсь', isNegative: true },
          { pronoun: 'you', example: 'Are you using the right tools?', translation: 'Ты используешь правильные инструменты?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to use my savings', translation: 'Я собираюсь использовать свои сбережения' },
          { pronoun: 'you', example: 'You are going to use this knowledge', translation: 'Ты будешь использовать эти знания' },
          { pronoun: 'he', example: 'He is going to use better materials', translation: 'Он собирается использовать лучшие материалы' },
          { pronoun: 'we', example: 'We are going to use their services', translation: 'Мы собираемся воспользоваться их услугами' },
          { pronoun: 'they', example: 'They are going to use a translator', translation: 'Они собираются использовать переводчика' },
          { pronoun: 'I', example: 'I am not going to use shortcuts', translation: 'Я не собираюсь использовать ярлыки', isNegative: true },
          { pronoun: 'you', example: 'Are you going to use this?', translation: 'Ты собираешься это использовать?', isQuestion: true }
        ]
      }
    ]
  },

  // 17. FIND
  {
    word: 'find',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['находить', 'найти', 'обнаруживать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I find this topic very interesting', translation: 'Я нахожу эту тему очень интересной' },
          { pronoun: 'you', example: 'You find happiness in small things', translation: 'Ты находишь счастье в мелочах' },
          { pronoun: 'he', example: 'He finds solutions to difficult problems', translation: 'Он находит решения сложных проблем' },
          { pronoun: 'she', example: 'She finds time for her hobbies', translation: 'Она находит время для своих хобби' },
          { pronoun: 'we', example: 'We find new opportunities every day', translation: 'Мы находим новые возможности каждый день' },
          { pronoun: 'they', example: 'They find the best deals online', translation: 'Они находят лучшие предложения онлайн' },
          { pronoun: 'I', example: 'I do not find this funny', translation: 'Я не нахожу это смешным', isNegative: true },
          { pronoun: 'you', example: 'Do you find this difficult?', translation: 'Ты находишь это сложным?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I found my old diary yesterday', translation: 'Я нашел свой старый дневник вчера' },
          { pronoun: 'you', example: 'You found the perfect gift', translation: 'Ты нашел идеальный подарок' },
          { pronoun: 'he', example: 'He found a great job opportunity', translation: 'Он нашел отличную возможность работы' },
          { pronoun: 'we', example: 'We found a nice restaurant', translation: 'Мы нашли хороший ресторан' },
          { pronoun: 'they', example: 'They found the missing documents', translation: 'Они нашли пропавшие документы' },
          { pronoun: 'I', example: 'I did not find what I needed', translation: 'Я не нашел то, что мне нужно', isNegative: true },
          { pronoun: 'you', example: 'Did you find your keys?', translation: 'Ты нашел свои ключи?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will find a way somehow', translation: 'Я как-нибудь найду способ' },
          { pronoun: 'you', example: 'You will find your true calling', translation: 'Ты найдешь свое истинное призвание' },
          { pronoun: 'he', example: 'He will find the right answer', translation: 'Он найдет правильный ответ' },
          { pronoun: 'we', example: 'We will find a solution together', translation: 'Мы вместе найдем решение' },
          { pronoun: 'they', example: 'They will find better opportunities', translation: 'Они найдут лучшие возможности' },
          { pronoun: 'I', example: 'I will not find excuses anymore', translation: 'Я больше не буду искать оправдания', isNegative: true },
          { pronoun: 'you', example: 'Will you find time for me?', translation: 'Ты найдешь время для меня?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have found my true passion', translation: 'Я нашел свое истинное призвание' },
          { pronoun: 'you', example: 'You have found the right path', translation: 'Ты нашел правильный путь' },
          { pronoun: 'he', example: 'He has found peace and happiness', translation: 'Он нашел мир и счастье' },
          { pronoun: 'we', example: 'We have found a great team', translation: 'Мы нашли отличную команду' },
          { pronoun: 'they', example: 'They have found what they needed', translation: 'Они нашли то, что им нужно' },
          { pronoun: 'I', example: 'I have not found any mistakes', translation: 'Я не нашел никаких ошибок', isNegative: true },
          { pronoun: 'you', example: 'Have you found the answer yet?', translation: 'Ты уже нашел ответ?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am finding it hard to concentrate', translation: 'Мне трудно сосредоточиться' },
          { pronoun: 'you', example: 'You are finding your own way', translation: 'Ты находишь свой собственный путь' },
          { pronoun: 'he', example: 'He is finding new opportunities everywhere', translation: 'Он находит новые возможности везде' },
          { pronoun: 'we', example: 'We are finding more evidence daily', translation: 'Мы находим больше доказательств ежедневно' },
          { pronoun: 'they', example: 'They are finding solutions to problems', translation: 'Они находят решения проблем' },
          { pronoun: 'I', example: 'I am not finding this easy', translation: 'Я не нахожу это легким', isNegative: true },
          { pronoun: 'you', example: 'Are you finding what you need?', translation: 'Ты находишь то, что тебе нужно?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to find my keys', translation: 'Я собираюсь найти свои ключи' },
          { pronoun: 'you', example: 'You are going to find out soon', translation: 'Ты скоро узнаешь' },
          { pronoun: 'he', example: 'He is going to find a new job', translation: 'Он собирается найти новую работу' },
          { pronoun: 'we', example: 'We are going to find the truth', translation: 'Мы собираемся найти правду' },
          { pronoun: 'they', example: 'They are going to find alternatives', translation: 'Они собираются найти альтернативы' },
          { pronoun: 'I', example: 'I am not going to find fault', translation: 'Я не собираюсь придираться', isNegative: true },
          { pronoun: 'you', example: 'Are you going to find help?', translation: 'Ты собираешься найти помощь?', isQuestion: true }
        ]
      }
    ]
  },

  // 18. TELL
  {
    word: 'tell',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['рассказывать', 'сказать', 'сообщать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I tell stories to my children', translation: 'Я рассказываю истории своим детям' },
          { pronoun: 'you', example: 'You tell the truth always', translation: 'Ты всегда говоришь правду' },
          { pronoun: 'he', example: 'He tells jokes at parties', translation: 'Он рассказывает шутки на вечеринках' },
          { pronoun: 'she', example: 'She tells me about her day', translation: 'Она рассказывает мне о своем дне' },
          { pronoun: 'we', example: 'We tell each other everything', translation: 'Мы рассказываем друг другу все' },
          { pronoun: 'they', example: 'They tell amazing travel stories', translation: 'Они рассказывают удивительные истории о путешествиях' },
          { pronoun: 'I', example: 'I do not tell lies', translation: 'Я не рассказываю лжи', isNegative: true },
          { pronoun: 'you', example: 'Do you tell your secrets?', translation: 'Ты рассказываешь свои секреты?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I told you this would happen', translation: 'Я говорил тебе, что это произойдет' },
          { pronoun: 'you', example: 'You told me the whole story', translation: 'Ты рассказал мне всю историю' },
          { pronoun: 'he', example: 'He told us about his adventure', translation: 'Он рассказал нам о своем приключении' },
          { pronoun: 'we', example: 'We told them the good news', translation: 'Мы сообщили им хорошие новости' },
          { pronoun: 'they', example: 'They told me about the problem', translation: 'Они рассказали мне о проблеме' },
          { pronoun: 'I', example: 'I did not tell anyone else', translation: 'Я никому больше не рассказывал', isNegative: true },
          { pronoun: 'you', example: 'Did you tell him the truth?', translation: 'Ты сказал ему правду?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will tell you everything later', translation: 'Я расскажу тебе все позже' },
          { pronoun: 'you', example: 'You will tell them the news', translation: 'Ты сообщишь им новости' },
          { pronoun: 'he', example: 'He will tell us his decision', translation: 'Он сообщит нам свое решение' },
          { pronoun: 'we', example: 'We will tell you when ready', translation: 'Мы скажем тебе, когда будем готовы' },
          { pronoun: 'they', example: 'They will tell the whole truth', translation: 'Они расскажут всю правду' },
          { pronoun: 'I', example: 'I will not tell a soul', translation: 'Я не расскажу ни душе', isNegative: true },
          { pronoun: 'you', example: 'Will you tell me your secret?', translation: 'Ты расскажешь мне свой секрет?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have told you many times', translation: 'Я говорил тебе много раз' },
          { pronoun: 'you', example: 'You have told me that story', translation: 'Ты рассказывал мне эту историю' },
          { pronoun: 'he', example: 'He has told everyone about it', translation: 'Он рассказал всем об этом' },
          { pronoun: 'we', example: 'We have told them the truth', translation: 'Мы сказали им правду' },
          { pronoun: 'they', example: 'They have told us their concerns', translation: 'Они рассказали нам о своих опасениях' },
          { pronoun: 'I', example: 'I have not told anyone yet', translation: 'Я еще никому не рассказывал', isNegative: true },
          { pronoun: 'you', example: 'Have you told her the news?', translation: 'Ты сообщил ей новости?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am telling you the truth', translation: 'Я говорю тебе правду' },
          { pronoun: 'you', example: 'You are telling me something important', translation: 'Ты рассказываешь мне что-то важное' },
          { pronoun: 'he', example: 'He is telling an interesting story', translation: 'Он рассказывает интересную историю' },
          { pronoun: 'we', example: 'We are telling them about it', translation: 'Мы рассказываем им об этом' },
          { pronoun: 'they', example: 'They are telling the whole truth', translation: 'Они рассказывают всю правду' },
          { pronoun: 'I', example: 'I am not telling you anything', translation: 'Я не рассказываю тебе ничего', isNegative: true },
          { pronoun: 'you', example: 'What are you telling them?', translation: 'Что ты им рассказываешь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to tell him today', translation: 'Я собираюсь сказать ему сегодня' },
          { pronoun: 'you', example: 'You are going to tell everyone', translation: 'Ты собираешься рассказать всем' },
          { pronoun: 'he', example: 'He is going to tell his story', translation: 'Он собирается рассказать свою историю' },
          { pronoun: 'we', example: 'We are going to tell the truth', translation: 'Мы собираемся сказать правду' },
          { pronoun: 'they', example: 'They are going to tell us soon', translation: 'Они скоро нам расскажут' },
          { pronoun: 'I', example: 'I am not going to tell lies', translation: 'Я не собираюсь лгать', isNegative: true },
          { pronoun: 'you', example: 'Are you going to tell her?', translation: 'Ты собираешься сказать ей?', isQuestion: true }
        ]
      }
    ]
  },

  // 19. WORK
  {
    word: 'work',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['работать', 'трудиться', 'функционировать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I work from home these days', translation: 'Я работаю из дома в эти дни' },
          { pronoun: 'you', example: 'You work too many hours', translation: 'Ты работаешь слишком много часов' },
          { pronoun: 'he', example: 'He works at a big company', translation: 'Он работает в большой компании' },
          { pronoun: 'she', example: 'She works as a doctor', translation: 'Она работает врачом' },
          { pronoun: 'we', example: 'We work well as a team', translation: 'Мы хорошо работаем как команда' },
          { pronoun: 'they', example: 'They work in the tech industry', translation: 'Они работают в индустрии технологий' },
          { pronoun: 'I', example: 'I do not work on weekends', translation: 'Я не работаю по выходным', isNegative: true },
          { pronoun: 'you', example: 'Where do you work now?', translation: 'Где ты сейчас работаешь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I worked late last night', translation: 'Я работал допоздна прошлой ночью' },
          { pronoun: 'you', example: 'You worked so hard yesterday', translation: 'Ты так усердно работал вчера' },
          { pronoun: 'he', example: 'He worked for that company before', translation: 'Он раньше работал в той компании' },
          { pronoun: 'we', example: 'We worked together on the project', translation: 'Мы работали вместе над проектом' },
          { pronoun: 'they', example: 'They worked through the weekend', translation: 'Они работали все выходные' },
          { pronoun: 'I', example: 'I did not work yesterday', translation: 'Я не работал вчера', isNegative: true },
          { pronoun: 'you', example: 'Did you work on Saturday?', translation: 'Ты работал в субботу?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will work from the office tomorrow', translation: 'Я буду работать из офиса завтра' },
          { pronoun: 'you', example: 'You will work with great people', translation: 'Ты будешь работать с отличными людьми' },
          { pronoun: 'he', example: 'He will work on this project', translation: 'Он будет работать над этим проектом' },
          { pronoun: 'we', example: 'We will work together on this', translation: 'Мы будем работать над этим вместе' },
          { pronoun: 'they', example: 'They will work overtime this week', translation: 'Они будут работать сверхурочно на этой неделе' },
          { pronoun: 'I', example: 'I will not work on holidays', translation: 'Я не буду работать в праздники', isNegative: true },
          { pronoun: 'you', example: 'Will you work with us?', translation: 'Ты будешь работать с нами?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have worked here for years', translation: 'Я работаю здесь много лет' },
          { pronoun: 'you', example: 'You have worked really hard today', translation: 'Ты очень усердно работал сегодня' },
          { pronoun: 'he', example: 'He has worked in many countries', translation: 'Он работал во многих странах' },
          { pronoun: 'we', example: 'We have worked on this all week', translation: 'Мы работали над этим всю неделю' },
          { pronoun: 'they', example: 'They have worked together for years', translation: 'Они работают вместе много лет' },
          { pronoun: 'I', example: 'I have not worked there before', translation: 'Я не работал там раньше', isNegative: true },
          { pronoun: 'you', example: 'Have you worked with him?', translation: 'Ты работал с ним?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am working on something important', translation: 'Я работаю над чем-то важным' },
          { pronoun: 'you', example: 'You are working too hard lately', translation: 'Ты слишком много работаешь в последнее время' },
          { pronoun: 'he', example: 'He is working from home today', translation: 'Он работает из дома сегодня' },
          { pronoun: 'we', example: 'We are working on a solution', translation: 'Мы работаем над решением' },
          { pronoun: 'they', example: 'They are working on the project', translation: 'Они работают над проектом' },
          { pronoun: 'I', example: 'I am not working today', translation: 'Я не работаю сегодня', isNegative: true },
          { pronoun: 'you', example: 'Are you working late tonight?', translation: 'Ты работаешь допоздна сегодня вечером?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to work harder', translation: 'Я собираюсь работать усерднее' },
          { pronoun: 'you', example: 'You are going to work abroad', translation: 'Ты собираешься работать за границей' },
          { pronoun: 'he', example: 'He is going to work remotely', translation: 'Он собирается работать удаленно' },
          { pronoun: 'we', example: 'We are going to work together', translation: 'Мы собираемся работать вместе' },
          { pronoun: 'they', example: 'They are going to work overtime', translation: 'Они собираются работать сверхурочно' },
          { pronoun: 'I', example: 'I am not going to work there', translation: 'Я не собираюсь работать там', isNegative: true },
          { pronoun: 'you', example: 'Are you going to work tomorrow?', translation: 'Ты собираешься работать завтра?', isQuestion: true }
        ]
      }
    ]
  },

  // 20. CALL
  {
    word: 'call',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['звонить', 'звать', 'называть']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I call my parents every week', translation: 'Я звоню своим родителям каждую неделю' },
          { pronoun: 'you', example: 'You call me at strange times', translation: 'Ты звонишь мне в странное время' },
          { pronoun: 'he', example: 'He calls this place his home', translation: 'Он называет это место своим домом' },
          { pronoun: 'she', example: 'She calls her dog Lucky', translation: 'Она называет свою собаку Лаки' },
          { pronoun: 'we', example: 'We call this process automation', translation: 'Мы называем этот процесс автоматизацией' },
          { pronoun: 'they', example: 'They call it a modern approach', translation: 'Они называют это современным подходом' },
          { pronoun: 'I', example: 'I do not call people late', translation: 'Я не звоню людям поздно', isNegative: true },
          { pronoun: 'you', example: 'Do you call this progress?', translation: 'Ты называешь это прогрессом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I called you three times yesterday', translation: 'Я звонил тебе три раза вчера' },
          { pronoun: 'you', example: 'You called at the perfect moment', translation: 'Ты позвонил в идеальный момент' },
          { pronoun: 'he', example: 'He called an emergency meeting', translation: 'Он созвал экстренное собрание' },
          { pronoun: 'we', example: 'We called for help immediately', translation: 'Мы немедленно позвали на помощь' },
          { pronoun: 'they', example: 'They called it a great success', translation: 'Они назвали это большим успехом' },
          { pronoun: 'I', example: 'I did not call you back', translation: 'Я не перезвонил тебе', isNegative: true },
          { pronoun: 'you', example: 'Did you call the doctor?', translation: 'Ты позвонил доктору?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will call you this evening', translation: 'Я позвоню тебе сегодня вечером' },
          { pronoun: 'you', example: 'You will call me when ready', translation: 'Ты позвонишь мне, когда будешь готов' },
          { pronoun: 'he', example: 'He will call a meeting tomorrow', translation: 'Он созовет собрание завтра' },
          { pronoun: 'we', example: 'We will call this project complete', translation: 'Мы назовем этот проект завершенным' },
          { pronoun: 'they', example: 'They will call for more support', translation: 'Они попросят больше поддержки' },
          { pronoun: 'I', example: 'I will not call anymore', translation: 'Я больше не буду звонить', isNegative: true },
          { pronoun: 'you', example: 'Will you call me later?', translation: 'Ты позвонишь мне позже?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have called several times today', translation: 'Я звонил несколько раз сегодня' },
          { pronoun: 'you', example: 'You have called me many names', translation: 'Ты называл меня многими именами' },
          { pronoun: 'he', example: 'He has called everyone to meeting', translation: 'Он созвал всех на собрание' },
          { pronoun: 'we', example: 'We have called for immediate action', translation: 'Мы призвали к немедленным действиям' },
          { pronoun: 'they', example: 'They have called it a success', translation: 'Они назвали это успехом' },
          { pronoun: 'I', example: 'I have not called him yet', translation: 'Я еще не звонил ему', isNegative: true },
          { pronoun: 'you', example: 'Have you called your mom?', translation: 'Ты позвонил своей маме?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am calling to confirm appointment', translation: 'Я звоню, чтобы подтвердить встречу' },
          { pronoun: 'you', example: 'You are calling at bad time', translation: 'Ты звонишь в неудобное время' },
          { pronoun: 'he', example: 'He is calling everyone right now', translation: 'Он звонит всем прямо сейчас' },
          { pronoun: 'we', example: 'We are calling for more volunteers', translation: 'Мы призываем больше волонтеров' },
          { pronoun: 'they', example: 'They are calling it a masterpiece', translation: 'Они называют это шедевром' },
          { pronoun: 'I', example: 'I am not calling you names', translation: 'Я не обзываю тебя', isNegative: true },
          { pronoun: 'you', example: 'Why are you calling me?', translation: 'Почему ты звонишь мне?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to call him tonight', translation: 'Я собираюсь позвонить ему сегодня вечером' },
          { pronoun: 'you', example: 'You are going to call the shots', translation: 'Ты собираешься командовать' },
          { pronoun: 'he', example: 'He is going to call it quits', translation: 'Он собирается уйти' },
          { pronoun: 'we', example: 'We are going to call for change', translation: 'Мы собираемся призвать к переменам' },
          { pronoun: 'they', example: 'They are going to call meeting', translation: 'Они собираются созвать собрание' },
          { pronoun: 'I', example: 'I am not going to call again', translation: 'Я не собираюсь звонить снова', isNegative: true },
          { pronoun: 'you', example: 'Are you going to call them?', translation: 'Ты собираешься позвонить им?', isQuestion: true }
        ]
      }
    ]
  },

  // 21. TRY
  {
    word: 'try',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['пытаться', 'пробовать', 'стараться']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I try my best every single day', translation: 'Я стараюсь изо всех сил каждый день' },
          { pronoun: 'you', example: 'You try to help everyone', translation: 'Ты пытаешься помочь всем' },
          { pronoun: 'he', example: 'He tries new things all the time', translation: 'Он пробует новые вещи все время' },
          { pronoun: 'she', example: 'She tries to be positive', translation: 'Она старается быть позитивной' },
          { pronoun: 'we', example: 'We try to meet regularly', translation: 'Мы стараемся встречаться регулярно' },
          { pronoun: 'they', example: 'They try different approaches', translation: 'Они пробуют разные подходы' },
          { pronoun: 'I', example: 'I do not try to impress', translation: 'Я не пытаюсь впечатлить', isNegative: true },
          { pronoun: 'you', example: 'Do you try hard enough?', translation: 'Ты достаточно стараешься?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I tried everything I could think of', translation: 'Я попробовал все, что мог придумать' },
          { pronoun: 'you', example: 'You tried your best yesterday', translation: 'Ты старался изо всех сил вчера' },
          { pronoun: 'he', example: 'He tried to call you last night', translation: 'Он пытался позвонить тебе прошлой ночью' },
          { pronoun: 'we', example: 'We tried a new restaurant', translation: 'Мы попробовали новый ресторан' },
          { pronoun: 'they', example: 'They tried to warn us', translation: 'Они пытались предупредить нас' },
          { pronoun: 'I', example: 'I did not try hard enough', translation: 'Я недостаточно старался', isNegative: true },
          { pronoun: 'you', example: 'Did you try that dish?', translation: 'Ты пробовал то блюдо?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will try to be there', translation: 'Я постараюсь быть там' },
          { pronoun: 'you', example: 'You will try something new', translation: 'Ты попробуешь что-то новое' },
          { pronoun: 'he', example: 'He will try again tomorrow', translation: 'Он попробует снова завтра' },
          { pronoun: 'we', example: 'We will try our best', translation: 'Мы сделаем все возможное' },
          { pronoun: 'they', example: 'They will try different methods', translation: 'Они попробуют разные методы' },
          { pronoun: 'I', example: 'I will not try anymore', translation: 'Я больше не буду пытаться', isNegative: true },
          { pronoun: 'you', example: 'Will you try it again?', translation: 'Ты попробуешь еще раз?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have tried many different options', translation: 'Я попробовал много разных вариантов' },
          { pronoun: 'you', example: 'You have tried your best', translation: 'Ты старался изо всех сил' },
          { pronoun: 'he', example: 'He has tried to contact you', translation: 'Он пытался связаться с тобой' },
          { pronoun: 'we', example: 'We have tried this before', translation: 'Мы пробовали это раньше' },
          { pronoun: 'they', example: 'They have tried everything possible', translation: 'Они попробовали все возможное' },
          { pronoun: 'I', example: 'I have not tried that yet', translation: 'Я еще не пробовал это', isNegative: true },
          { pronoun: 'you', example: 'Have you tried calling him?', translation: 'Ты пробовал позвонить ему?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am trying to concentrate here', translation: 'Я пытаюсь сосредоточиться здесь' },
          { pronoun: 'you', example: 'You are trying too hard', translation: 'Ты слишком стараешься' },
          { pronoun: 'he', example: 'He is trying a new approach', translation: 'Он пробует новый подход' },
          { pronoun: 'we', example: 'We are trying to solve this', translation: 'Мы пытаемся решить это' },
          { pronoun: 'they', example: 'They are trying their best', translation: 'Они стараются изо всех сил' },
          { pronoun: 'I', example: 'I am not trying to argue', translation: 'Я не пытаюсь спорить', isNegative: true },
          { pronoun: 'you', example: 'What are you trying to do?', translation: 'Что ты пытаешься сделать?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to try harder', translation: 'Я собираюсь стараться больше' },
          { pronoun: 'you', example: 'You are going to try it', translation: 'Ты собираешься попробовать это' },
          { pronoun: 'he', example: 'He is going to try again', translation: 'Он собирается попробовать снова' },
          { pronoun: 'we', example: 'We are going to try something else', translation: 'Мы собираемся попробовать что-то другое' },
          { pronoun: 'they', example: 'They are going to try tomorrow', translation: 'Они собираются попробовать завтра' },
          { pronoun: 'I', example: 'I am not going to try that', translation: 'Я не собираюсь пробовать это', isNegative: true },
          { pronoun: 'you', example: 'Are you going to try again?', translation: 'Ты собираешься попробовать снова?', isQuestion: true }
        ]
      }
    ]
  },

  // 22. ASK
  {
    word: 'ask',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['спрашивать', 'просить', 'задавать вопрос']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I ask questions during every lecture', translation: 'Я задаю вопросы на каждой лекции' },
          { pronoun: 'you', example: 'You ask for help when needed', translation: 'Ты просишь помощи, когда нужно' },
          { pronoun: 'he', example: 'He asks very intelligent questions', translation: 'Он задает очень умные вопросы' },
          { pronoun: 'she', example: 'She asks about you often', translation: 'Она часто спрашивает о тебе' },
          { pronoun: 'we', example: 'We ask for feedback regularly', translation: 'Мы регулярно просим обратную связь' },
          { pronoun: 'they', example: 'They ask too many questions', translation: 'Они задают слишком много вопросов' },
          { pronoun: 'I', example: 'I do not ask for much', translation: 'Я не прошу многого', isNegative: true },
          { pronoun: 'you', example: 'Do you ask people for advice?', translation: 'Ты спрашиваешь людей о совете?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I asked her to marry me', translation: 'Я попросил ее выйти за меня замуж' },
          { pronoun: 'you', example: 'You asked a very good question', translation: 'Ты задал очень хороший вопрос' },
          { pronoun: 'he', example: 'He asked for more time', translation: 'Он попросил больше времени' },
          { pronoun: 'we', example: 'We asked everyone to come', translation: 'Мы попросили всех прийти' },
          { pronoun: 'they', example: 'They asked about our plans', translation: 'Они спрашивали о наших планах' },
          { pronoun: 'I', example: 'I did not ask for this', translation: 'Я не просил этого', isNegative: true },
          { pronoun: 'you', example: 'Did you ask for permission?', translation: 'Ты попросил разрешения?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will ask him tomorrow', translation: 'Я спрошу его завтра' },
          { pronoun: 'you', example: 'You will ask the right questions', translation: 'Ты зададешь правильные вопросы' },
          { pronoun: 'he', example: 'He will ask for your help', translation: 'Он попросит твоей помощи' },
          { pronoun: 'we', example: 'We will ask for their opinion', translation: 'Мы попросим их мнение' },
          { pronoun: 'they', example: 'They will ask about the details', translation: 'Они спросят о деталях' },
          { pronoun: 'I', example: 'I will not ask again', translation: 'Я не буду спрашивать снова', isNegative: true },
          { pronoun: 'you', example: 'Will you ask her out?', translation: 'Ты пригласишь ее на свидание?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have asked you several times', translation: 'Я спрашивал тебя несколько раз' },
          { pronoun: 'you', example: 'You have asked all the questions', translation: 'Ты задал все вопросы' },
          { pronoun: 'he', example: 'He has asked for another chance', translation: 'Он попросил еще один шанс' },
          { pronoun: 'we', example: 'We have asked everyone already', translation: 'Мы уже спросили всех' },
          { pronoun: 'they', example: 'They have asked for more information', translation: 'Они попросили больше информации' },
          { pronoun: 'I', example: 'I have not asked for favors', translation: 'Я не просил об одолжениях', isNegative: true },
          { pronoun: 'you', example: 'Have you asked your parents?', translation: 'Ты спросил своих родителей?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am asking for your opinion', translation: 'Я спрашиваю твое мнение' },
          { pronoun: 'you', example: 'You are asking too much', translation: 'Ты просишь слишком много' },
          { pronoun: 'he', example: 'He is asking everyone the same thing', translation: 'Он спрашивает всех одно и то же' },
          { pronoun: 'we', example: 'We are asking for volunteers', translation: 'Мы просим волонтеров' },
          { pronoun: 'they', example: 'They are asking about the price', translation: 'Они спрашивают о цене' },
          { pronoun: 'I', example: 'I am not asking for permission', translation: 'Я не прошу разрешения', isNegative: true },
          { pronoun: 'you', example: 'Why are you asking me this?', translation: 'Почему ты спрашиваешь меня об этом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to ask for help', translation: 'Я собираюсь попросить помощи' },
          { pronoun: 'you', example: 'You are going to ask questions', translation: 'Ты собираешься задавать вопросы' },
          { pronoun: 'he', example: 'He is going to ask her out', translation: 'Он собирается пригласить ее на свидание' },
          { pronoun: 'we', example: 'We are going to ask the manager', translation: 'Мы собираемся спросить менеджера' },
          { pronoun: 'they', example: 'They are going to ask for more', translation: 'Они собираются просить больше' },
          { pronoun: 'I', example: 'I am not going to ask nicely', translation: 'Я не собираюсь просить вежливо', isNegative: true },
          { pronoun: 'you', example: 'Are you going to ask him?', translation: 'Ты собираешься спросить его?', isQuestion: true }
        ]
      }
    ]
  },

  // 23. NEED
  {
    word: 'need',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['нуждаться', 'требоваться', 'необходимо']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I need some time to think', translation: 'Мне нужно время подумать' },
          { pronoun: 'you', example: 'You need to see a doctor', translation: 'Тебе нужно показаться врачу' },
          { pronoun: 'he', example: 'He needs a vacation badly', translation: 'Ему очень нужен отпуск' },
          { pronoun: 'she', example: 'She needs more practice', translation: 'Ей нужна больше практики' },
          { pronoun: 'we', example: 'We need to talk about this', translation: 'Нам нужно поговорить об этом' },
          { pronoun: 'they', example: 'They need better equipment', translation: 'Им нужно лучшее оборудование' },
          { pronoun: 'I', example: 'I do not need any help', translation: 'Мне не нужна никакая помощь', isNegative: true },
          { pronoun: 'you', example: 'Do you need anything else?', translation: 'Тебе нужно что-нибудь еще?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I needed your advice yesterday', translation: 'Мне нужен был твой совет вчера' },
          { pronoun: 'you', example: 'You needed more time', translation: 'Тебе нужно было больше времени' },
          { pronoun: 'he', example: 'He needed to leave early', translation: 'Ему нужно было уйти рано' },
          { pronoun: 'we', example: 'We needed some fresh air', translation: 'Нам нужен был свежий воздух' },
          { pronoun: 'they', example: 'They needed more information', translation: 'Им нужна была больше информации' },
          { pronoun: 'I', example: 'I did not need any reminders', translation: 'Мне не нужны были напоминания', isNegative: true },
          { pronoun: 'you', example: 'Did you need my assistance?', translation: 'Тебе нужна была моя помощь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will need your support', translation: 'Мне понадобится твоя поддержка' },
          { pronoun: 'you', example: 'You will need this information', translation: 'Тебе понадобится эта информация' },
          { pronoun: 'he', example: 'He will need more practice', translation: 'Ему понадобится больше практики' },
          { pronoun: 'we', example: 'We will need some supplies', translation: 'Нам понадобятся припасы' },
          { pronoun: 'they', example: 'They will need more time', translation: 'Им понадобится больше времени' },
          { pronoun: 'I', example: 'I will not need anything', translation: 'Мне ничего не понадобится', isNegative: true },
          { pronoun: 'you', example: 'Will you need a ride?', translation: 'Тебе понадобится подвезти?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have needed this for ages', translation: 'Мне это нужно было целую вечность' },
          { pronoun: 'you', example: 'You have needed a break', translation: 'Тебе нужен был перерыв' },
          { pronoun: 'he', example: 'He has needed our help', translation: 'Ему нужна была наша помощь' },
          { pronoun: 'we', example: 'We have needed more resources', translation: 'Нам нужны были больше ресурсов' },
          { pronoun: 'they', example: 'They have needed better tools', translation: 'Им нужны были лучшие инструменты' },
          { pronoun: 'I', example: 'I have not needed any assistance', translation: 'Мне не нужна была помощь', isNegative: true },
          { pronoun: 'you', example: 'Have you needed more time?', translation: 'Тебе нужно было больше времени?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am needing some space', translation: 'Мне нужно немного пространства' },
          { pronoun: 'you', example: 'You are needing more attention', translation: 'Тебе нужно больше внимания' },
          { pronoun: 'he', example: 'He is needing our support', translation: 'Ему нужна наша поддержка' },
          { pronoun: 'we', example: 'We are needing additional funds', translation: 'Нам нужны дополнительные средства' },
          { pronoun: 'they', example: 'They are needing better guidance', translation: 'Им нужно лучшее руководство' },
          { pronoun: 'I', example: 'I am not needing anything now', translation: 'Мне сейчас ничего не нужно', isNegative: true },
          { pronoun: 'you', example: 'What are you needing from me?', translation: 'Что тебе от меня нужно?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to need backup', translation: 'Мне понадобится подкрепление' },
          { pronoun: 'you', example: 'You are going to need patience', translation: 'Тебе понадобится терпение' },
          { pronoun: 'he', example: 'He is going to need help', translation: 'Ему понадобится помощь' },
          { pronoun: 'we', example: 'We are going to need supplies', translation: 'Нам понадобятся припасы' },
          { pronoun: 'they', example: 'They are going to need support', translation: 'Им понадобится поддержка' },
          { pronoun: 'I', example: 'I am not going to need that', translation: 'Мне это не понадобится', isNegative: true },
          { pronoun: 'you', example: 'Are you going to need more?', translation: 'Тебе понадобится больше?', isQuestion: true }
        ]
      }
    ]
  },

  // 24. FEEL
  {
    word: 'feel',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['чувствовать', 'ощущать', 'считать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I feel great about this decision', translation: 'Я отлично отношусь к этому решению' },
          { pronoun: 'you', example: 'You feel happy when dancing', translation: 'Ты чувствуешь себя счастливым, когда танцуешь' },
          { pronoun: 'he', example: 'He feels confident about his work', translation: 'Он чувствует уверенность в своей работе' },
          { pronoun: 'she', example: 'She feels grateful for everything', translation: 'Она чувствует благодарность за все' },
          { pronoun: 'we', example: 'We feel excited about the project', translation: 'Мы взволнованы проектом' },
          { pronoun: 'they', example: 'They feel proud of their achievements', translation: 'Они гордятся своими достижениями' },
          { pronoun: 'I', example: 'I do not feel comfortable here', translation: 'Я не чувствую себя комфортно здесь', isNegative: true },
          { pronoun: 'you', example: 'How do you feel today?', translation: 'Как ты себя чувствуешь сегодня?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I felt really happy yesterday', translation: 'Я чувствовал себя очень счастливым вчера' },
          { pronoun: 'you', example: 'You felt sad after the movie', translation: 'Ты почувствовал грусть после фильма' },
          { pronoun: 'he', example: 'He felt tired after the workout', translation: 'Он чувствовал усталость после тренировки' },
          { pronoun: 'we', example: 'We felt relieved when it ended', translation: 'Мы почувствовали облегчение, когда это закончилось' },
          { pronoun: 'they', example: 'They felt nervous before the exam', translation: 'Они нервничали перед экзаменом' },
          { pronoun: 'I', example: 'I did not feel well yesterday', translation: 'Я плохо себя чувствовал вчера', isNegative: true },
          { pronoun: 'you', example: 'Did you feel the earthquake?', translation: 'Ты почувствовал землетрясение?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will feel better tomorrow', translation: 'Я буду чувствовать себя лучше завтра' },
          { pronoun: 'you', example: 'You will feel amazing afterwards', translation: 'Ты будешь чувствовать себя потрясающе после' },
          { pronoun: 'he', example: 'He will feel proud of you', translation: 'Он будет гордиться тобой' },
          { pronoun: 'we', example: 'We will feel more confident', translation: 'Мы будем чувствовать себя увереннее' },
          { pronoun: 'they', example: 'They will feel the difference', translation: 'Они почувствуют разницу' },
          { pronoun: 'I', example: 'I will not feel guilty', translation: 'Я не буду чувствовать вину', isNegative: true },
          { pronoun: 'you', example: 'Will you feel ready by then?', translation: 'Ты будешь чувствовать себя готовым к тому времени?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have felt this way before', translation: 'Я чувствовал себя так раньше' },
          { pronoun: 'you', example: 'You have felt this pain before', translation: 'Ты чувствовал эту боль раньше' },
          { pronoun: 'he', example: 'He has felt better lately', translation: 'Он чувствует себя лучше в последнее время' },
          { pronoun: 'we', example: 'We have felt welcomed here', translation: 'Мы чувствовали себя желанными здесь' },
          { pronoun: 'they', example: 'They have felt pressure from work', translation: 'Они чувствовали давление от работы' },
          { pronoun: 'I', example: 'I have not felt this good', translation: 'Я не чувствовал себя так хорошо', isNegative: true },
          { pronoun: 'you', example: 'Have you felt any improvement?', translation: 'Ты почувствовал какое-то улучшение?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am feeling much better now', translation: 'Я чувствую себя намного лучше сейчас' },
          { pronoun: 'you', example: 'You are feeling tired today', translation: 'Ты чувствуешь усталость сегодня' },
          { pronoun: 'he', example: 'He is feeling under the weather', translation: 'Он неважно себя чувствует' },
          { pronoun: 'we', example: 'We are feeling optimistic about it', translation: 'Мы настроены оптимистично по этому поводу' },
          { pronoun: 'they', example: 'They are feeling the pressure now', translation: 'Они чувствуют давление сейчас' },
          { pronoun: 'I', example: 'I am not feeling well today', translation: 'Я плохо себя чувствую сегодня', isNegative: true },
          { pronoun: 'you', example: 'Are you feeling better now?', translation: 'Ты чувствуешь себя лучше сейчас?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to feel strange', translation: 'Я буду чувствовать себя странно' },
          { pronoun: 'you', example: 'You are going to feel great', translation: 'Ты будешь чувствовать себя отлично' },
          { pronoun: 'he', example: 'He is going to feel disappointed', translation: 'Он будет чувствовать разочарование' },
          { pronoun: 'we', example: 'We are going to feel relieved', translation: 'Мы почувствуем облегчение' },
          { pronoun: 'they', example: 'They are going to feel excited', translation: 'Они будут взволнованы' },
          { pronoun: 'I', example: 'I am not going to feel bad', translation: 'Я не буду чувствовать себя плохо', isNegative: true },
          { pronoun: 'you', example: 'Are you going to feel okay?', translation: 'Ты будешь чувствовать себя хорошо?', isQuestion: true }
        ]
      }
    ]
  },

  // 25. BECOME
  {
    word: 'become',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['становиться', 'стать', 'делаться']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I become nervous before exams', translation: 'Я нервничаю перед экзаменами' },
          { pronoun: 'you', example: 'You become very quiet sometimes', translation: 'Ты иногда становишься очень тихим' },
          { pronoun: 'he', example: 'He becomes angry when stressed', translation: 'Он злится, когда в стрессе' },
          { pronoun: 'she', example: 'She becomes emotional during movies', translation: 'Она становится эмоциональной во время фильмов' },
          { pronoun: 'we', example: 'We become stronger with practice', translation: 'Мы становимся сильнее с практикой' },
          { pronoun: 'they', example: 'They become friends very quickly', translation: 'Они очень быстро становятся друзьями' },
          { pronoun: 'I', example: 'I do not become angry easily', translation: 'Я не злюсь легко', isNegative: true },
          { pronoun: 'you', example: 'Do you become bored at work?', translation: 'Тебе становится скучно на работе?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I became a teacher last year', translation: 'Я стал учителем в прошлом году' },
          { pronoun: 'you', example: 'You became famous overnight', translation: 'Ты стал знаменитым за одну ночь' },
          { pronoun: 'he', example: 'He became president of the company', translation: 'Он стал президентом компании' },
          { pronoun: 'we', example: 'We became good friends quickly', translation: 'Мы быстро стали хорошими друзьями' },
          { pronoun: 'they', example: 'They became very successful', translation: 'Они стали очень успешными' },
          { pronoun: 'I', example: 'I did not become discouraged', translation: 'Я не унывал', isNegative: true },
          { pronoun: 'you', example: 'When did you become interested?', translation: 'Когда ты заинтересовался?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will become a better person', translation: 'Я стану лучшим человеком' },
          { pronoun: 'you', example: 'You will become very successful', translation: 'Ты станешь очень успешным' },
          { pronoun: 'he', example: 'He will become the new manager', translation: 'Он станет новым менеджером' },
          { pronoun: 'we', example: 'We will become stronger together', translation: 'Мы станем сильнее вместе' },
          { pronoun: 'they', example: 'They will become good friends', translation: 'Они станут хорошими друзьями' },
          { pronoun: 'I', example: 'I will not become complacent', translation: 'Я не стану самодовольным', isNegative: true },
          { pronoun: 'you', example: 'Will you become a doctor?', translation: 'Ты станешь врачом?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have become more confident', translation: 'Я стал более уверенным' },
          { pronoun: 'you', example: 'You have become very skilled', translation: 'Ты стал очень умелым' },
          { pronoun: 'he', example: 'He has become a great leader', translation: 'Он стал отличным лидером' },
          { pronoun: 'we', example: 'We have become better at this', translation: 'Мы стали лучше в этом' },
          { pronoun: 'they', example: 'They have become very close friends', translation: 'Они стали очень близкими друзьями' },
          { pronoun: 'I', example: 'I have not become discouraged yet', translation: 'Я еще не пал духом', isNegative: true },
          { pronoun: 'you', example: 'Have you become interested in art?', translation: 'Ты заинтересовался искусством?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am becoming more patient', translation: 'Я становлюсь более терпеливым' },
          { pronoun: 'you', example: 'You are becoming very good', translation: 'Ты становишься очень хорошим' },
          { pronoun: 'he', example: 'He is becoming more confident', translation: 'Он становится более уверенным' },
          { pronoun: 'we', example: 'We are becoming better at it', translation: 'Мы становимся лучше в этом' },
          { pronoun: 'they', example: 'They are becoming quite famous', translation: 'Они становятся довольно известными' },
          { pronoun: 'I', example: 'I am not becoming pessimistic', translation: 'Я не становлюсь пессимистичным', isNegative: true },
          { pronoun: 'you', example: 'Are you becoming tired of this?', translation: 'Тебе это надоедает?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to become stronger', translation: 'Я стану сильнее' },
          { pronoun: 'you', example: 'You are going to become famous', translation: 'Ты станешь знаменитым' },
          { pronoun: 'he', example: 'He is going to become an expert', translation: 'Он станет экспертом' },
          { pronoun: 'we', example: 'We are going to become partners', translation: 'Мы станем партнерами' },
          { pronoun: 'they', example: 'They are going to become champions', translation: 'Они станут чемпионами' },
          { pronoun: 'I', example: 'I am not going to become lazy', translation: 'Я не стану ленивым', isNegative: true },
          { pronoun: 'you', example: 'Are you going to become a teacher?', translation: 'Ты станешь учителем?', isQuestion: true }
        ]
      }
    ]
  },

  // 26. LEAVE
  {
    word: 'leave',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['уходить', 'покидать', 'оставлять']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I leave for work at eight', translation: 'Я ухожу на работу в восемь' },
          { pronoun: 'you', example: 'You leave the lights on always', translation: 'Ты всегда оставляешь свет включенным' },
          { pronoun: 'he', example: 'He leaves home very early', translation: 'Он уходит из дома очень рано' },
          { pronoun: 'she', example: 'She leaves messages for everyone', translation: 'Она оставляет сообщения для всех' },
          { pronoun: 'we', example: 'We leave the office at six', translation: 'Мы покидаем офис в шесть' },
          { pronoun: 'they', example: 'They leave town every summer', translation: 'Они уезжают из города каждое лето' },
          { pronoun: 'I', example: 'I do not leave things unfinished', translation: 'Я не оставляю дела незавершенными', isNegative: true },
          { pronoun: 'you', example: 'When do you leave for vacation?', translation: 'Когда ты уезжаешь в отпуск?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I left my keys at home', translation: 'Я оставил свои ключи дома' },
          { pronoun: 'you', example: 'You left without saying goodbye', translation: 'Ты ушел, не попрощавшись' },
          { pronoun: 'he', example: 'He left the company last month', translation: 'Он покинул компанию в прошлом месяце' },
          { pronoun: 'we', example: 'We left the party early', translation: 'Мы ушли с вечеринки рано' },
          { pronoun: 'they', example: 'They left town yesterday morning', translation: 'Они уехали из города вчера утром' },
          { pronoun: 'I', example: 'I did not leave any messages', translation: 'Я не оставлял никаких сообщений', isNegative: true },
          { pronoun: 'you', example: 'Did you leave something behind?', translation: 'Ты что-то оставил?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will leave tomorrow morning', translation: 'Я уеду завтра утром' },
          { pronoun: 'you', example: 'You will leave when ready', translation: 'Ты уйдешь, когда будешь готов' },
          { pronoun: 'he', example: 'He will leave the country soon', translation: 'Он скоро покинет страну' },
          { pronoun: 'we', example: 'We will leave after dinner', translation: 'Мы уйдем после ужина' },
          { pronoun: 'they', example: 'They will leave at midnight', translation: 'Они уедут в полночь' },
          { pronoun: 'I', example: 'I will not leave you alone', translation: 'Я не оставлю тебя одного', isNegative: true },
          { pronoun: 'you', example: 'Will you leave a message?', translation: 'Ты оставишь сообщение?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have left my phone somewhere', translation: 'Я где-то оставил свой телефон' },
          { pronoun: 'you', example: 'You have left your mark here', translation: 'Ты оставил свой след здесь' },
          { pronoun: 'he', example: 'He has left for the airport', translation: 'Он уехал в аэропорт' },
          { pronoun: 'we', example: 'We have left everything behind', translation: 'Мы оставили все позади' },
          { pronoun: 'they', example: 'They have left the building', translation: 'Они покинули здание' },
          { pronoun: 'I', example: 'I have not left yet', translation: 'Я еще не ушел', isNegative: true },
          { pronoun: 'you', example: 'Have you left anything behind?', translation: 'Ты что-нибудь оставил?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am leaving right now', translation: 'Я ухожу прямо сейчас' },
          { pronoun: 'you', example: 'You are leaving too early', translation: 'Ты уходишь слишком рано' },
          { pronoun: 'he', example: 'He is leaving the company', translation: 'Он покидает компанию' },
          { pronoun: 'we', example: 'We are leaving in five minutes', translation: 'Мы уходим через пять минут' },
          { pronoun: 'they', example: 'They are leaving for vacation', translation: 'Они уезжают в отпуск' },
          { pronoun: 'I', example: 'I am not leaving without you', translation: 'Я не ухожу без тебя', isNegative: true },
          { pronoun: 'you', example: 'Are you leaving so soon?', translation: 'Ты уже уходишь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to leave early', translation: 'Я собираюсь уйти рано' },
          { pronoun: 'you', example: 'You are going to leave town', translation: 'Ты собираешься уехать из города' },
          { pronoun: 'he', example: 'He is going to leave his job', translation: 'Он собирается уйти с работы' },
          { pronoun: 'we', example: 'We are going to leave soon', translation: 'Мы скоро уйдем' },
          { pronoun: 'they', example: 'They are going to leave together', translation: 'Они собираются уйти вместе' },
          { pronoun: 'I', example: 'I am not going to leave yet', translation: 'Я пока не собираюсь уходить', isNegative: true },
          { pronoun: 'you', example: 'Are you going to leave now?', translation: 'Ты собираешься уходить сейчас?', isQuestion: true }
        ]
      }
    ]
  },

  // 27. PUT
  {
    word: 'put',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['класть', 'ставить', 'помещать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I put sugar in my coffee', translation: 'Я кладу сахар в кофе' },
          { pronoun: 'you', example: 'You put too much salt', translation: 'Ты кладешь слишком много соли' },
          { pronoun: 'he', example: 'He puts everything in order', translation: 'Он приводит все в порядок' },
          { pronoun: 'she', example: 'She puts effort into everything', translation: 'Она вкладывает усилия во все' },
          { pronoun: 'we', example: 'We put our trust in you', translation: 'Мы доверяем тебе' },
          { pronoun: 'they', example: 'They put pressure on everyone', translation: 'Они оказывают давление на всех' },
          { pronoun: 'I', example: 'I do not put things off', translation: 'Я не откладываю дела', isNegative: true },
          { pronoun: 'you', example: 'Where do you put your keys?', translation: 'Куда ты кладешь свои ключи?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I put the book on the shelf', translation: 'Я положил книгу на полку' },
          { pronoun: 'you', example: 'You put in a lot of effort', translation: 'Ты вложил много усилий' },
          { pronoun: 'he', example: 'He put the idea into practice', translation: 'Он воплотил идею в жизнь' },
          { pronoun: 'we', example: 'We put everything in the car', translation: 'Мы положили все в машину' },
          { pronoun: 'they', example: 'They put forward a proposal', translation: 'Они выдвинули предложение' },
          { pronoun: 'I', example: 'I did not put it there', translation: 'Я не клал это туда', isNegative: true },
          { pronoun: 'you', example: 'Did you put away the dishes?', translation: 'Ты убрал посуду?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will put this in writing', translation: 'Я изложу это письменно' },
          { pronoun: 'you', example: 'You will put things right', translation: 'Ты все исправишь' },
          { pronoun: 'he', example: 'He will put in more effort', translation: 'Он вложит больше усилий' },
          { pronoun: 'we', example: 'We will put it to vote', translation: 'Мы вынесем это на голосование' },
          { pronoun: 'they', example: 'They will put forward a plan', translation: 'Они представят план' },
          { pronoun: 'I', example: 'I will not put up with this', translation: 'Я не буду это терпеть', isNegative: true },
          { pronoun: 'you', example: 'Will you put it in writing?', translation: 'Ты изложишь это письменно?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have put a lot of work', translation: 'Я вложил много работы' },
          { pronoun: 'you', example: 'You have put on some weight', translation: 'Ты набрал немного веса' },
          { pronoun: 'he', example: 'He has put his heart into it', translation: 'Он вложил в это душу' },
          { pronoun: 'we', example: 'We have put together a team', translation: 'Мы собрали команду' },
          { pronoun: 'they', example: 'They have put in many hours', translation: 'Они вложили много часов' },
          { pronoun: 'I', example: 'I have not put it away yet', translation: 'Я еще не убрал это', isNegative: true },
          { pronoun: 'you', example: 'Have you put away the groceries?', translation: 'Ты убрал продукты?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am putting together a plan', translation: 'Я составляю план' },
          { pronoun: 'you', example: 'You are putting in great effort', translation: 'Ты вкладываешь большие усилия' },
          { pronoun: 'he', example: 'He is putting on his shoes', translation: 'Он надевает туфли' },
          { pronoun: 'we', example: 'We are putting up decorations', translation: 'Мы развешиваем украшения' },
          { pronoun: 'they', example: 'They are putting pressure on us', translation: 'Они оказывают на нас давление' },
          { pronoun: 'I', example: 'I am not putting up with it', translation: 'Я не терплю это', isNegative: true },
          { pronoun: 'you', example: 'What are you putting on?', translation: 'Что ты надеваешь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to put money aside', translation: 'Я собираюсь отложить деньги' },
          { pronoun: 'you', example: 'You are going to put on weight', translation: 'Ты наберешь вес' },
          { pronoun: 'he', example: 'He is going to put up a fight', translation: 'Он собирается сопротивляться' },
          { pronoun: 'we', example: 'We are going to put it together', translation: 'Мы собираемся собрать это' },
          { pronoun: 'they', example: 'They are going to put forward ideas', translation: 'Они собираются выдвинуть идеи' },
          { pronoun: 'I', example: 'I am not going to put it off', translation: 'Я не собираюсь откладывать это', isNegative: true },
          { pronoun: 'you', example: 'Are you going to put it away?', translation: 'Ты собираешься убрать это?', isQuestion: true }
        ]
      }
    ]
  },

  // 28. MEAN
  {
    word: 'mean',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['означать', 'иметь в виду', 'значить']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I mean what I say', translation: 'Я имею в виду то, что говорю' },
          { pronoun: 'you', example: 'You mean a lot to me', translation: 'Ты много значишь для меня' },
          { pronoun: 'he', example: 'He means no harm to anyone', translation: 'Он не желает никому зла' },
          { pronoun: 'she', example: 'She means well by her actions', translation: 'Она желает добра своими действиями' },
          { pronoun: 'we', example: 'We mean business this time', translation: 'Мы настроены серьезно на этот раз' },
          { pronoun: 'they', example: 'They mean the world to me', translation: 'Они значат для меня весь мир' },
          { pronoun: 'I', example: 'I do not mean to offend', translation: 'Я не хочу обидеть', isNegative: true },
          { pronoun: 'you', example: 'What do you mean by that?', translation: 'Что ты имеешь в виду под этим?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I meant to call you yesterday', translation: 'Я собирался позвонить тебе вчера' },
          { pronoun: 'you', example: 'You meant well by your words', translation: 'Ты желал добра своими словами' },
          { pronoun: 'he', example: 'He meant no disrespect at all', translation: 'Он совсем не хотел неуважения' },
          { pronoun: 'we', example: 'We meant to arrive earlier', translation: 'Мы хотели прибыть раньше' },
          { pronoun: 'they', example: 'They meant everything to him', translation: 'Они значили для него все' },
          { pronoun: 'I', example: 'I did not mean to hurt you', translation: 'Я не хотел обидеть тебя', isNegative: true },
          { pronoun: 'you', example: 'What did you mean by that?', translation: 'Что ты имел в виду под этим?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will mean what I say', translation: 'Я буду иметь в виду то, что говорю' },
          { pronoun: 'you', example: 'You will mean a lot someday', translation: 'Ты когда-нибудь будешь много значить' },
          { pronoun: 'he', example: 'He will mean no harm', translation: 'Он не будет желать зла' },
          { pronoun: 'we', example: 'We will mean business next time', translation: 'Мы будем серьезно настроены в следующий раз' },
          { pronoun: 'they', example: 'They will mean more to you', translation: 'Они будут значить для тебя больше' },
          { pronoun: 'I', example: 'I will not mean any disrespect', translation: 'Я не буду иметь в виду неуважение', isNegative: true },
          { pronoun: 'you', example: 'Will you mean what you say?', translation: 'Ты будешь иметь в виду то, что говоришь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have meant to tell you', translation: 'Я собирался сказать тебе' },
          { pronoun: 'you', example: 'You have meant so much', translation: 'Ты так много значил' },
          { pronoun: 'he', example: 'He has meant well all along', translation: 'Он все время желал добра' },
          { pronoun: 'we', example: 'We have meant to visit you', translation: 'Мы собирались навестить тебя' },
          { pronoun: 'they', example: 'They have meant everything to us', translation: 'Они значили для нас все' },
          { pronoun: 'I', example: 'I have not meant to neglect you', translation: 'Я не хотел пренебрегать тобой', isNegative: true },
          { pronoun: 'you', example: 'Have you meant what you said?', translation: 'Ты имел в виду то, что сказал?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am meaning to say something', translation: 'Я хочу что-то сказать' },
          { pronoun: 'you', example: 'You are meaning more to everyone', translation: 'Ты становишься важнее для всех' },
          { pronoun: 'he', example: 'He is meaning to apologize', translation: 'Он собирается извиниться' },
          { pronoun: 'we', example: 'We are meaning to help', translation: 'Мы хотим помочь' },
          { pronoun: 'they', example: 'They are meaning well by this', translation: 'Они желают добра этим' },
          { pronoun: 'I', example: 'I am not meaning to be rude', translation: 'Я не хочу быть грубым', isNegative: true },
          { pronoun: 'you', example: 'What are you meaning by that?', translation: 'Что ты имеешь в виду под этим?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to mean it', translation: 'Я буду иметь это в виду' },
          { pronoun: 'you', example: 'You are going to mean something', translation: 'Ты будешь что-то значить' },
          { pronoun: 'he', example: 'He is going to mean business', translation: 'Он будет настроен серьезно' },
          { pronoun: 'we', example: 'We are going to mean well', translation: 'Мы будем желать добра' },
          { pronoun: 'they', example: 'They are going to mean more', translation: 'Они будут значить больше' },
          { pronoun: 'I', example: 'I am not going to mean harm', translation: 'Я не буду желать зла', isNegative: true },
          { pronoun: 'you', example: 'Are you going to mean that?', translation: 'Ты будешь иметь это в виду?', isQuestion: true }
        ]
      }
    ]
  },

  // 29. KEEP
  {
    word: 'keep',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['хранить', 'держать', 'продолжать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I keep all my photos safe', translation: 'Я храню все свои фотографии в безопасности' },
          { pronoun: 'you', example: 'You keep your promises always', translation: 'Ты всегда держишь свои обещания' },
          { pronoun: 'he', example: 'He keeps his room very clean', translation: 'Он держит свою комнату очень чистой' },
          { pronoun: 'she', example: 'She keeps in touch with everyone', translation: 'Она поддерживает связь со всеми' },
          { pronoun: 'we', example: 'We keep track of expenses', translation: 'Мы следим за расходами' },
          { pronoun: 'they', example: 'They keep working late hours', translation: 'Они продолжают работать допоздна' },
          { pronoun: 'I', example: 'I do not keep secrets', translation: 'Я не храню секретов', isNegative: true },
          { pronoun: 'you', example: 'Do you keep a diary?', translation: 'Ты ведешь дневник?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I kept your letter for years', translation: 'Я хранил твое письмо годами' },
          { pronoun: 'you', example: 'You kept me waiting too long', translation: 'Ты заставил меня ждать слишком долго' },
          { pronoun: 'he', example: 'He kept his word to me', translation: 'Он сдержал свое слово передо мной' },
          { pronoun: 'we', example: 'We kept the secret safe', translation: 'Мы сохранили секрет в тайне' },
          { pronoun: 'they', example: 'They kept trying until success', translation: 'Они продолжали пытаться до успеха' },
          { pronoun: 'I', example: 'I did not keep any records', translation: 'Я не вел никаких записей', isNegative: true },
          { pronoun: 'you', example: 'Did you keep the receipt?', translation: 'Ты сохранил чек?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will keep this between us', translation: 'Я сохраню это между нами' },
          { pronoun: 'you', example: 'You will keep your promise', translation: 'Ты сдержишь свое обещание' },
          { pronoun: 'he', example: 'He will keep working hard', translation: 'Он будет продолжать усердно работать' },
          { pronoun: 'we', example: 'We will keep you informed', translation: 'Мы будем держать тебя в курсе' },
          { pronoun: 'they', example: 'They will keep the tradition alive', translation: 'Они сохранят традицию' },
          { pronoun: 'I', example: 'I will not keep you waiting', translation: 'Я не заставлю тебя ждать', isNegative: true },
          { pronoun: 'you', example: 'Will you keep in touch?', translation: 'Ты будешь поддерживать связь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have kept this secret', translation: 'Я хранил этот секрет' },
          { pronoun: 'you', example: 'You have kept your word', translation: 'Ты сдержал свое слово' },
          { pronoun: 'he', example: 'He has kept in good shape', translation: 'Он поддерживал хорошую форму' },
          { pronoun: 'we', example: 'We have kept in touch', translation: 'Мы поддерживали связь' },
          { pronoun: 'they', example: 'They have kept the tradition', translation: 'Они сохранили традицию' },
          { pronoun: 'I', example: 'I have not kept any records', translation: 'Я не вел никаких записей', isNegative: true },
          { pronoun: 'you', example: 'Have you kept the documents?', translation: 'Ты сохранил документы?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am keeping an eye on it', translation: 'Я слежу за этим' },
          { pronoun: 'you', example: 'You are keeping me waiting', translation: 'Ты заставляешь меня ждать' },
          { pronoun: 'he', example: 'He is keeping himself busy', translation: 'Он держит себя занятым' },
          { pronoun: 'we', example: 'We are keeping track of everything', translation: 'Мы следим за всем' },
          { pronoun: 'they', example: 'They are keeping the place clean', translation: 'Они поддерживают место в чистоте' },
          { pronoun: 'I', example: 'I am not keeping any secrets', translation: 'Я не храню никаких секретов', isNegative: true },
          { pronoun: 'you', example: 'Are you keeping well?', translation: 'Ты хорошо себя чувствуешь?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to keep trying', translation: 'Я буду продолжать пытаться' },
          { pronoun: 'you', example: 'You are going to keep learning', translation: 'Ты будешь продолжать учиться' },
          { pronoun: 'he', example: 'He is going to keep fighting', translation: 'Он будет продолжать бороться' },
          { pronoun: 'we', example: 'We are going to keep working', translation: 'Мы будем продолжать работать' },
          { pronoun: 'they', example: 'They are going to keep going', translation: 'Они будут продолжать идти' },
          { pronoun: 'I', example: 'I am not going to keep quiet', translation: 'Я не буду молчать', isNegative: true },
          { pronoun: 'you', example: 'Are you going to keep it?', translation: 'Ты собираешься сохранить это?', isQuestion: true }
        ]
      }
    ]
  },

  // 30. LET
  {
    word: 'let',
    partOfSpeech: PartOfSpeech.VERB,
    languageCode: 'en',
    translations: [
      {
        languageCode: 'ru',
        translations: ['позволять', 'разрешать', 'давать']
      }
    ],
    examples: [],
    grammaticalExamples: [
      {
        tenseName: 'Present Simple',
        examples: [
          { pronoun: 'I', example: 'I let my children make decisions', translation: 'Я позволяю своим детям принимать решения' },
          { pronoun: 'you', example: 'You let people take advantage', translation: 'Ты позволяешь людям пользоваться тобой' },
          { pronoun: 'he', example: 'He lets his students ask questions', translation: 'Он позволяет своим студентам задавать вопросы' },
          { pronoun: 'she', example: 'She lets go of past mistakes', translation: 'Она отпускает прошлые ошибки' },
          { pronoun: 'we', example: 'We let everyone voice their opinion', translation: 'Мы позволяем всем высказать свое мнение' },
          { pronoun: 'they', example: 'They let us use their facilities', translation: 'Они разрешают нам пользоваться их помещениями' },
          { pronoun: 'I', example: 'I do not let negativity affect me', translation: 'Я не позволяю негативу влиять на меня', isNegative: true },
          { pronoun: 'you', example: 'Do you let people borrow books?', translation: 'Ты даешь людям брать книги?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Past Simple',
        examples: [
          { pronoun: 'I', example: 'I let him borrow my car', translation: 'Я разрешил ему взять мою машину' },
          { pronoun: 'you', example: 'You let me down yesterday', translation: 'Ты подвел меня вчера' },
          { pronoun: 'he', example: 'He let the opportunity slip away', translation: 'Он упустил возможность' },
          { pronoun: 'we', example: 'We let them join our team', translation: 'Мы позволили им присоединиться к нашей команде' },
          { pronoun: 'they', example: 'They let us stay for free', translation: 'Они разрешили нам остаться бесплатно' },
          { pronoun: 'I', example: 'I did not let fear stop me', translation: 'Я не позволил страху остановить меня', isNegative: true },
          { pronoun: 'you', example: 'Did you let them know?', translation: 'Ты дал им знать?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future Simple',
        examples: [
          { pronoun: 'I', example: 'I will let you know soon', translation: 'Я дам тебе знать скоро' },
          { pronoun: 'you', example: 'You will let me help you', translation: 'Ты позволишь мне помочь тебе' },
          { pronoun: 'he', example: 'He will let us decide', translation: 'Он позволит нам решить' },
          { pronoun: 'we', example: 'We will let them participate', translation: 'Мы позволим им участвовать' },
          { pronoun: 'they', example: 'They will let you go early', translation: 'Они отпустят тебя рано' },
          { pronoun: 'I', example: 'I will not let you fail', translation: 'Я не позволю тебе провалиться', isNegative: true },
          { pronoun: 'you', example: 'Will you let me try?', translation: 'Ты позволишь мне попробовать?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Perfect',
        examples: [
          { pronoun: 'I', example: 'I have let things slide lately', translation: 'Я позволил делам пойти на самотек в последнее время' },
          { pronoun: 'you', example: 'You have let me down before', translation: 'Ты подводил меня раньше' },
          { pronoun: 'he', example: 'He has let go of anger', translation: 'Он отпустил гнев' },
          { pronoun: 'we', example: 'We have let them take charge', translation: 'Мы позволили им взять на себя ответственность' },
          { pronoun: 'they', example: 'They have let us use resources', translation: 'Они разрешили нам использовать ресурсы' },
          { pronoun: 'I', example: 'I have not let anyone interfere', translation: 'Я не позволил никому вмешиваться', isNegative: true },
          { pronoun: 'you', example: 'Have you let them know yet?', translation: 'Ты уже дал им знать?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Present Continuous',
        examples: [
          { pronoun: 'I', example: 'I am letting you take the lead', translation: 'Я позволяю тебе взять инициативу' },
          { pronoun: 'you', example: 'You are letting emotions control you', translation: 'Ты позволяешь эмоциям контролировать тебя' },
          { pronoun: 'he', example: 'He is letting himself get stressed', translation: 'Он позволяет себе нервничать' },
          { pronoun: 'we', example: 'We are letting them make choices', translation: 'Мы позволяем им делать выбор' },
          { pronoun: 'they', example: 'They are letting us access files', translation: 'Они разрешают нам доступ к файлам' },
          { pronoun: 'I', example: 'I am not letting this go', translation: 'Я не оставлю это так', isNegative: true },
          { pronoun: 'you', example: 'Are you letting him decide?', translation: 'Ты позволяешь ему решать?', isQuestion: true }
        ]
      },
      {
        tenseName: 'Future (going to)',
        examples: [
          { pronoun: 'I', example: 'I am going to let you decide', translation: 'Я позволю тебе решить' },
          { pronoun: 'you', example: 'You are going to let it happen', translation: 'Ты позволишь этому случиться' },
          { pronoun: 'he', example: 'He is going to let them try', translation: 'Он позволит им попробовать' },
          { pronoun: 'we', example: 'We are going to let nature take course', translation: 'Мы позволим природе взять свое' },
          { pronoun: 'they', example: 'They are going to let us stay', translation: 'Они позволят нам остаться' },
          { pronoun: 'I', example: 'I am not going to let fear win', translation: 'Я не позволю страху победить', isNegative: true },
          { pronoun: 'you', example: 'Are you going to let them go?', translation: 'Ты собираешься отпустить их?', isQuestion: true }
        ]
      }
    ]
  }
]
