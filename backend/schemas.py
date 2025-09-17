from pydantic import BaseModel
from typing import Optional

class PredictionRequest(BaseModel):
    # --- Basic (Required) Features ---
    # These 5 are the primary inputs for a basic request.
    koi_period: float
    koi_depth: float
    koi_duration: float
    koi_prad: float
    koi_teq: float

    # --- Advanced (Optional) Features with Defaults ---
    # These are the remaining 31 features with their mean values from your
    # training data used as defaults if not provided in a request.
    koi_period_err1: float = 0.0009820351824735662
    koi_period_err2: float = -0.0009820351824735662
    koi_time0bk: float = 158.24929105533482
    koi_time0bk_err1: float = 0.007456161710990067
    koi_time0bk_err2: float = -0.007456161710990067
    koi_impact: float = 0.6142801986542775
    koi_impact_err1: float = 2.2189317526433836
    koi_impact_err2: float = -0.2886448253764819
    koi_duration_err1: float = 0.2502765203460429
    koi_duration_err2: float = -0.2502765203460429
    koi_depth_err1: float = 64.40177827619353
    koi_depth_err2: float = -64.40177827619353
    koi_prad_err1: float = 6.92892181992951
    koi_prad_err2: float = -7.749993591797501
    koi_insol: float = 5560.128808074334
    koi_insol_err1: float = 2663.821560397309
    koi_insol_err2: float = -2734.932600128164
    koi_model_snr: float = 296.79283883370715
    koi_tce_plnt_num: float = 1.2417494392822814
    koi_steff: float = 5697.727330983659
    koi_steff_err1: float = 142.17862864466517
    koi_steff_err2: float = -159.13537327779557
    koi_slogg: float = 4.316257609740468
    koi_slogg_err1: float = 0.12203540531880809
    koi_slogg_err2: float = -0.13159820570330022
    koi_srad: float = 1.6622164370394106
    koi_srad_err1: float = 0.31787055430951616
    koi_srad_err2: float = -0.36937311759051594
    ra: float = 292.04482610060876
    dec: float = 43.87650165764178
    koi_kepmag: float = 14.293490067286125