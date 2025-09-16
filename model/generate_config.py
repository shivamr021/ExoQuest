import pandas as pd

try:
    # Load your training data file
    train_df = pd.read_csv('train.csv')

    # Drop the target column 'koi_disposition' to get only the feature columns
    if 'koi_disposition' in train_df.columns:
        train_df_features = train_df.drop(columns=['koi_disposition'])
    else:
        # Handle case where the target might already be in a separate file
        train_df_features = train_df

    # Get the complete list of feature columns in the correct order
    model_columns = train_df_features.columns.tolist()

    # Calculate the mean for every feature column
    mean_values = train_df_features.mean()

    print("--- STEP 2: COPY THIS LIST INTO main.py ---")
    print(model_columns)

    print("\n\n--- STEP 3: COPY THESE VALUES INTO schemas.py ---")
    # We print this as a dictionary to make it easy to copy-paste
    print(mean_values.to_dict())

except FileNotFoundError:
    print("Error: Make sure 'train.csv' is in the same directory as this script.")