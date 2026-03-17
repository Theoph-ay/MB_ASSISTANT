from pydantic import BaseModel, Field

# Schema for Disease prompt
class DiseaseInput(BaseModel):
    disease_name: str = Field(
        description="The specific medical disease or condition to search for."
    )

# Schema for quiz prompts
class QuizInput(BaseModel):
    topic: str = Field(
        description="The specific Paediatrics or O&G disease to quiz the user on."
    )
    num: int = Field(description="The exact number of questions. Convert English words to integers.")