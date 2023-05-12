export interface HobbyTransformOptions {
    row_len: number
    mode: 'filter' | 'category' | 'quiz'
    additional_data?: string
    additional_entities?: any[]
    final: boolean
    page: number
    in_a_row: number
}