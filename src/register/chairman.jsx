import React from 'react'


const chairman = () => {
  return (
    <div>
      <h1>සභාපති</h1>
      <form>
        <div className='chairman-container'>
          <div><label>1. සභාපතිතුමාගේ සම්පූර්ණ නම</label>
          <input type="text" name="fullName" />
        </div>
        <div>
          <label>2. පෞද්ගලික ලිපිනය</label>
          <textarea name="address" />
        </div>
        <div>
          <label>3. දුරකථන අංකය</label>
          <input type="tel" name="phone" />
        </div>
        <div>
          <label>4. ඊමේල් ලිපිනය</label>
          <input type="email" name="email" />
        </div>
        <div>
          <label>5. ජාතික හැඳුනුම්පත් අංකය</label>
          <input type="text" name="nic" />
        </div>
        <div>
          <label>6. උපන් දිනය</label>
          <input type="date" name="dob" />
        </div>
        
    <label>
      7.ජාතික හැදුනුම්පත පිටපත අමුණන්න:
      <input type="file" name="nicCopy" accept=".pdf,.jpg,.png" />
    </label>
    <label><br></br>
      8.අත්සන පිටපත අමුණන්න:
      <input type="file" name="signature" accept=".pdf,.jpg,.png" />
    </label>
      <br />

        <button type="submit">Submit</button>
      </div>
      </form>
      
    </div>
  )
}

export default chairman
