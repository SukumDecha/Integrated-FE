const FILE_STATUS = {
  ONLINE: 'ONLINE', // เป็นไฟล์เดิมจาก backend
  DELETE: 'DELETE', // ไฟล์เดิม จาก BE ที่ถูกลบออก ใน request นี้
  MOVE: 'MOVE', // ไฟล์เดิม จาก BE ย้าย ลำดับการแสดง,
  NEW: "NEW" // ไฟล์ที่เพิ่มใหม่ (ต้องมี MultipartFile ด้วย)
}


export { FILE_STATUS }
