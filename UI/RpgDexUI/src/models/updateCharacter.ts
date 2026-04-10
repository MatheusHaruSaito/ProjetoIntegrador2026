import { Attributes } from "./attributes"
import { Skills } from "./skills"

export interface UpdateCharacter{
    id : string
    iconPath : string
    name : string
    description? :string
    attributes? : Attributes
    skills? : Skills
}
