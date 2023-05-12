import QUIZ from '../static/bot-text/quiz-text.json' assert {type: 'json'}
import {PsycheAttributes} from "../schema/user.psych.schema.js"
import {OptionsT, QuizQuestion} from "../bot/Quiz.js"

interface IExpectedSchema {
    name: string,
    options: OptionsT
}

export function questArrayFromFormat() {
    //todo: string to enum type conversion
    const quizArr: IExpectedSchema[] = <IExpectedSchema[]><unknown>QUIZ.questions
    return quizArr.map(quiz => new QuizQuestion(quiz.name, quiz.options))
}