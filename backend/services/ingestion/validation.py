from typing import List, Dict, Any, Type, Tuple
from pydantic import BaseModel, ValidationError

class Validator:
    """
    Validates transformed data against Pydantic ERD models.
    Separates valid records from invalid records, ensuring only 
    clean data reaches the Catalyst Data Store.
    """
    
    def validate_batch(self, model_class: Type[BaseModel], batch: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Validates a batch of dictionaries against a given Pydantic model.
        Returns a tuple: (valid_records, invalid_records)
        """
        valid = []
        invalid = []
        
        for record in batch:
            try:
                # model_validate validates the dictionary against the schema
                validated_model = model_class.model_validate(record)
                # If successful, dump it back to a dict (or keep as model, but we need dict for Catalyst push)
                valid.append(validated_model.model_dump(exclude_none=True))
            except ValidationError as e:
                # In production, we'd log the error to a monitoring system
                print(f"Validation Error for {model_class.__name__}: {e}")
                invalid.append({"record": record, "error": str(e)})
                
        return valid, invalid
