import os
import pickle
import numpy as np

DATASET_PATH = "/mnt/d/hand_data"
cam_list = ['840412062035','840412062037','840412062038','840412062076']

width, height = 640, 480

CAMERA_EXT = {
    '840412062076': {
        "extrinsics": [[1.0, 0.0, 0.0, 0.0],
                     [0.0, 1.0, 0.0, 0.0], 
                     [0.0, 0.0, 1.0, 0.0], 
                     [0.0, 0.0, 0.0, 1.0]
        ],
        "intrinsics": [615.665, 615.09, 306.514, 240.344]
    }, 
    '840412062035': {
        "extrinsics": [[0.5500, 0.5663, -0.6138, 175.2400],
                     [0.3317, 0.5263, 0.7829, -535.2004], 
                     [0.7664, -0.6342, 0.1016, 573.3568], 
                     [0.0, 0.0, 0.0, 1.0]
        ],
        "intrinsics": [619.598, 619.116, 325.345, 245.441]
    },
    '840412062038': {
        "extrinsics": [[0.1988, -0.3278, 0.9236, -655.83842],
                     [-0.5362, 0.7524, 0.3825, -250.0468],
                     [-0.8203, -0.5712, -0.02620, 719.1969],
                     [0.0, 0.0, 0.0, 1.0]
        ],
        "intrinsics": [619.475, 619.189, 313.715, 223.921]
    },
    '840412062037':  {
        "extrinsics": [[-0.9723, 0.2301, -0.0401, -101.9152],
                     [0.1365, 0.4205, -0.8970, 571.4364],
                     [-0.1895, -0.8776, -0.4403, 826.8667],
                     [0.0, 0.0, 0.0, 1.0]
        ],
        "intrinsics": [615.85, 615.477, 316.062, 247.156]
    }
}

calib_path = os.path.join(DATASET_PATH, "7-14-1-2_calib.pkl")
joints_path = os.path.join(DATASET_PATH, "7-14-1-2_joints.npy")

# Load the pickle file
with open(calib_path, 'rb') as f:
    calib_data = pickle.load(f)

# Load the numpy file
joints_data = np.load(joints_path)

# # Print the loaded data
# print("Calibration data:")
# print(calib_data)

N = joints_data.shape[0]
joints4view = np.ones((4, N, 21, 4, 1)).astype(np.int64)

print("Joints data:")
print(joints_data.shape, joints4view.shape)

for dev_idx, rs_dev in enumerate(cam_list):
    inv = np.linalg.inv(CAMERA_EXT[rs_dev]["extrinsics"])
    joints4view[dev_idx] = inv @ joints_data
    print(rs_dev, joints4view[dev_idx, 1, :, :3, 0].tolist())

# print(joints4view[2, 1, :, :3, 0].tolist())
# print(joints_data[1, :, :3, 0].tolist())