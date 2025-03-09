<main class="page-content">
  <!-- FeedBack-->
  <section class="section-66 section-sm-top-87 section-sm-bottom-100">
    <div class="container text-center">
      <div class="row row-40 row-md-70 justify-content-md-center">
        <div class="col-md-11">
          <h3 class="text-primary">Contacts Us</h3>
          <p class="big">
            If you have any questions, please contact us.<br>
            We will respond to you through email or phone message within 48 hours.
          </p>
        </div>
        <div class="col-sm-12">
          <!-- RD Mailform-->
          <form class="rd-mailform text" data-form-output="form-output-global" data-form-type="contact">
            <div class="row row-30">
              <div class="col-lg-4">
                <div class="form-wrap">
                  <label class="form-label" for="contact-name">Enter your name:</label>
                  <input class="form-input" id="contact-name" type="text" name="name" data-constraints="@Required">
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-wrap">
                  <label class="form-label" for="contact-email">Enter your email:</label>
                  <input class="form-input" id="contact-email" type="email" name="email" data-constraints="@Email @Required">
                </div>
              </div>
              <div class="col-lg-4">
                <div class="form-wrap">
                  <label class="form-label" for="contact-phone">Enter your phone:</label>
                  <input class="form-input" id="contact-phone" type="text" name="phone" data-constraints="@Numeric">
                </div>
              </div>
              <div class="col-sm-12">
                <div class="form-wrap">
                  <label class="form-label" for="contact-message">Message:</label>
                  <textarea class="form-input" id="contact-message" name="message" data-constraints="@Required"></textarea>
                </div>
              </div>
              <div class="col-sm-12">
                <button class="btn btn-primary" type="submit" onclick="sendMail()">submit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
  
  <div class="modal-wrapper" id="messageView">
    <div class="CN_pop_card">
      <div class="text-end" style="text-align:right; padding-right:0.5rem;">
        <h6 class="text-primary" id="popCloseButton" onclick="closePop()" style="display:none">x</h6>
      </div>
      <div class="mt-2 mb-2 box text-center">
        <h5 class="col-10 text-primary" id="message">Please Wait...</h5>
      </div>
      <div class="ms-1 me-1 mb-0" style="height: 5px;">
        <div class="progress" id="popProcessBar" style="display:none">
          <div class="progress-bar" style="width:100%;"></div>
        </div>
      </div>
    </div>
  </div>

  
  <script src="js/sendmail.js"></script>
</main>